import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are an expert AI teaching assistant for VedaAI — an AI-powered academic assessment platform used by teachers in India (CBSE/ICSE curriculum).

Your role is to help teachers with:
1. **Question & Answer Generation** — Create practice questions, quiz questions, MCQs, short/long answer questions for any subject and grade
2. **Lesson Planning** — Help plan lessons, learning objectives, and teaching strategies
3. **Rubric Design** — Help create marking rubrics and grading criteria
4. **Concept Explanations** — Explain academic concepts in a way teachers can use in class
5. **Assignment Ideas** — Suggest creative assignment ideas and project topics
6. **Curriculum Guidance** — Provide guidance on NCERT/CBSE/ICSE curriculum topics
7. **Student Assessment** — Advise on evaluation methods and student feedback strategies
8. **Differentiated Learning** — Suggest ways to cater to different learning abilities

Guidelines:
- Be concise, structured, and educationally sound
- Format responses with clear headings and bullet points when appropriate
- When generating questions, include difficulty levels (Easy/Medium/Hard) and marks
- Always tailor advice to the Indian school curriculum context
- Use markdown formatting for better readability`;

export async function* streamChatResponse(messages: ChatMessage[]): AsyncGenerator<string> {
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
}
