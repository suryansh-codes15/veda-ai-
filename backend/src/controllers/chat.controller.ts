import { Request, Response } from 'express';
import { streamChatResponse, ChatMessage } from '../services/chat.service';

export async function chat(req: Request, res: Response): Promise<void> {
  const { messages } = req.body as { messages: ChatMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ success: false, error: 'messages array is required' });
    return;
  }

  // Validate message structure
  const valid = messages.every(
    (m) =>
      typeof m === 'object' &&
      ['user', 'assistant'].includes(m.role) &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0
  );

  if (!valid) {
    res.status(400).json({ success: false, error: 'Invalid message format' });
    return;
  }

  // Set streaming SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    for await (const chunk of streamChatResponse(messages)) {
      // SSE format: data: <payload>\n\n
      res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (err: any) {
    console.error('Chat stream error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
  } finally {
    res.end();
  }
}
