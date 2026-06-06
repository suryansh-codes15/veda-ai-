import Groq from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { GeneratedPaper, QuestionTypeConfig } from '../../../shared/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Zod schema for strict validation of LLM output
const QuestionSchema = z.object({
  question: z.string().min(5),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  marks: z.number().positive(),
  answer: z.string().min(2),
  options: z.array(z.string()).optional(),
});

const SectionSchema = z.object({
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

const PaperSchema = z.object({
  schoolName: z.string(),
  subject: z.string(),
  grade: z.string(),
  timeAllowed: z.string(),
  maxMarks: z.number().positive(),
  sections: z.array(SectionSchema).min(1),
});

function buildPrompt(
  subject: string,
  grade: string,
  questionTypes: QuestionTypeConfig[],
  additionalInstructions?: string
): string {
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);

  const sectionBreakdown = questionTypes
    .map(
      (qt, i) =>
        `Section ${String.fromCharCode(65 + i)} — ${qt.type}: ${qt.count} questions, ${qt.marks} mark${qt.marks > 1 ? 's' : ''} each`
    )
    .join('\n');

  const timeEstimate =
    totalMarks <= 20
      ? '45 minutes'
      : totalMarks <= 40
        ? '1 hour 30 minutes'
        : totalMarks <= 60
          ? '2 hours'
          : '3 hours';

  return `You are an expert CBSE/ICSE teacher creating a structured exam question paper.

ASSIGNMENT DETAILS:
- Subject: ${subject}
- Class/Grade: ${grade}
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}
${additionalInstructions ? `- Special Instructions: ${additionalInstructions}` : ''}

SECTION BREAKDOWN (create one section per type, in this order):
${sectionBreakdown}

RULES:
1. Each section must have questions EXACTLY matching the count and marks specified above
2. Difficulty distribution per section: ~40% Easy, ~40% Medium, ~20% Hard (vary naturally)
3. For Multiple Choice Questions, include an "options" array with exactly 4 choices (A, B, C, D)
4. Questions must be academically appropriate for ${grade} ${subject}
5. Answers must be concise (1-3 sentences for short, 2-4 sentences for long answers)
6. Make questions curriculum-relevant and pedagogically sound
7. Section titles must be exactly "Section A", "Section B", etc.
8. Instructions must be contextual (e.g., "Attempt all questions. Each carries 1 mark." for MCQ)

OUTPUT FORMAT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "${subject}",
  "grade": "${grade}",
  "timeAllowed": "${timeEstimate}",
  "maxMarks": ${totalMarks},
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "questions": [
        {
          "question": "Question text here?",
          "difficulty": "Easy",
          "marks": 1,
          "answer": "Brief answer here.",
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
  ]
}`;
}

export async function generateQuestionPaper(
  subject: string,
  grade: string,
  questionTypes: QuestionTypeConfig[],
  additionalInstructions?: string
): Promise<GeneratedPaper> {
  const prompt = buildPrompt(subject, grade, questionTypes, additionalInstructions);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert teacher. You ONLY output valid JSON. Never use markdown, code fences, or any text outside the JSON object.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 6000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq API');

  // Clean any stray markdown fences just in case
  const cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Groq returned non-JSON response. Raw: ' + cleaned.slice(0, 200));
  }

  // Validate with Zod
  const result = PaperSchema.safeParse(parsed);
  if (!result.success) {
    console.error('Zod validation failed:', result.error.flatten());
    throw new Error('Generated paper failed schema validation: ' + result.error.message);
  }

  // Attach UUIDs to questions
  const paper: GeneratedPaper = {
    ...result.data,
    sections: result.data.sections.map((sec) => ({
      ...sec,
      questions: sec.questions.map((q) => ({
        ...q,
        id: uuidv4(),
      })),
    })),
  };

  return paper;
}
