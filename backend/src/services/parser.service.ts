import Groq from 'groq-sdk';

// pdf-parse has a quirky export — use require() for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Extracts text from a PDF or image file buffer.
 * - PDF: uses pdf-parse to extract text directly.
 * - Image (JPG/PNG): sends to Groq Llama 3.2 Vision to transcribe content.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimetype: string,
  originalName: string
): Promise<string> {
  const isPDF = mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const isImage =
    mimetype.startsWith('image/') ||
    /\.(jpg|jpeg|png)$/i.test(originalName);

  if (isPDF) {
    console.log(`📄 Parsing PDF: ${originalName}`);
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text) {
      throw new Error('Could not extract any text from the PDF. The file may be scanned/image-only.');
    }
    console.log(`✅ PDF parsed: extracted ${text.length} characters`);
    return text;
  }

  if (isImage) {
    console.log(`🖼️ Transcribing image via Llama 3.2 Vision: ${originalName}`);
    const base64 = buffer.toString('base64');

    // Use any-typed content array to satisfy Groq SDK strict typing
    const completion = await (groq.chat.completions.create as Function)({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimetype};base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: 'This is an educational document image. Please extract and transcribe ALL text content from this image accurately. Include all headings, paragraphs, questions, answers, formulas, diagram descriptions, and any other text you can see. Preserve the structure as much as possible.',
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const extracted = completion.choices[0]?.message?.content?.trim();
    if (!extracted) {
      throw new Error('Could not extract text from the image.');
    }
    console.log(`✅ Image transcribed: extracted ${extracted.length} characters`);
    return extracted;
  }

  throw new Error(`Unsupported file type: ${mimetype}. Please upload a PDF, JPG, or PNG file.`);
}
