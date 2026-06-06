'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '📝', label: 'Generate MCQs', prompt: 'Generate 5 multiple choice questions for Class 8 Science chapter on Photosynthesis. Include Easy, Medium, and Hard difficulty.' },
  { icon: '📋', label: 'Lesson Plan', prompt: 'Create a detailed lesson plan for teaching Fractions to Class 5 students. Include learning objectives, activities, and assessment.' },
  { icon: '✅', label: 'Marking Rubric', prompt: 'Create a marking rubric for a Class 10 English essay assignment worth 20 marks.' },
  { icon: '💡', label: 'Explain Concept', prompt: 'Explain Newton\'s Laws of Motion in a simple way that a Class 9 teacher can use in classroom.' },
  { icon: '🎯', label: 'Assignment Ideas', prompt: 'Suggest 5 creative project assignment ideas for Class 7 Social Science chapter on Medieval India.' },
  { icon: '📊', label: 'Question Bank', prompt: 'Create a question bank with 10 short answer questions for Class 10 Mathematics - Quadratic Equations. Include answers.' },
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer for bold, code, bullets, and headings
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-[15px] font-bold mt-4 mb-1.5 text-brand">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-[16px] font-bold mt-4 mb-2 text-brand">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-[17px] font-bold mt-4 mb-2 text-brand">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-none space-y-1.5 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-[13px] leading-relaxed">
              <span className="text-brand-accent mt-0.5 flex-shrink-0">▸</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-none space-y-1.5 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-[13px] leading-relaxed">
              <span className="text-brand-accent font-bold flex-shrink-0 min-w-[18px]">{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${i}`} className="bg-[#f5f4f0] border border-[#e8e5df] rounded-xl p-4 my-3 overflow-x-auto">
          <code className="text-[12px] font-mono text-brand">{codeLines.join('\n')}</code>
        </pre>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-[13px] leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-brand">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-[#f0ede8] px-1.5 py-0.5 rounded text-[12px] font-mono text-brand-accent">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-brand-accent underline" target="_blank">$1</a>');
}

export default function ToolkitPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream');

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;

          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              accumulated += parsed.delta;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: accumulated } : m
              ));
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '⚠️ Sorry, I encountered an error. Please try again.' }
            : m
        ));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
    setInput('');
  };

  const isEmpty = messages.length === 0;

  return (
    <AppShell title="AI Teacher's Toolkit">
      <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-brand flex items-center gap-2.5">
              <span className="text-brand-accent">✦</span>
              AI Teacher's Toolkit
            </h1>
            <p className="text-[13px] text-[#6b6660] mt-0.5">
              Your intelligent assistant for questions, lesson plans, rubrics & more
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-[12px] text-[#9b9590] hover:text-brand-accent transition-colors px-3 py-1.5 rounded-lg hover:bg-[#fff7f3]"
            >
              <span>↺</span> New Chat
            </button>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 mb-4">
          {isEmpty ? (
            /* Welcome / Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-[#fff7f3] border-2 border-brand-accent rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm">
                ✦
              </div>
              <h2 className="text-[20px] font-bold text-brand mb-2">How can I help you today?</h2>
              <p className="text-[13px] text-[#6b6660] max-w-md leading-relaxed mb-8">
                Ask me anything about teaching — from generating question papers to designing rubrics and lesson plans.
              </p>

              {/* Quick prompts grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={loading}
                    className="flex items-start gap-3 p-4 bg-white border border-[#e8e5df] rounded-2xl text-left hover:border-brand-accent hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group disabled:opacity-50"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{qp.icon}</span>
                    <div>
                      <div className="text-[13px] font-semibold text-brand mb-0.5">{qp.label}</div>
                      <div className="text-[11px] text-[#9b9590] leading-snug line-clamp-2">{qp.prompt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-5 pb-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#e8d5c8] text-[#b05a30]'
                      : 'bg-brand text-white'
                  }`}>
                    {msg.role === 'user' ? 'JD' : '✦'}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand text-white rounded-tr-sm'
                      : 'bg-[#f9f8f5] border border-[#e8e5df] text-brand rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-[13px] leading-relaxed">{msg.content}</p>
                    ) : msg.content === '' ? (
                      /* Thinking pulse */
                      <div className="flex items-center gap-1.5 py-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <MarkdownText text={msg.content} />
                    )}
                    <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-[#9b9590]'}`}>
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0">
          {/* Suggested follow-ups when chat has messages */}
          {messages.length > 0 && !loading && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {['Generate more questions', 'Make it harder', 'Create an answer key', 'Adjust for different grade'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-[11px] px-3 py-1.5 bg-[#f9f8f5] border border-[#e8e5df] rounded-full text-[#6b6660] hover:border-brand-accent hover:text-brand hover:bg-[#fff7f3] transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end bg-[#f9f8f5] border border-[#e8e5df] rounded-2xl p-3 focus-within:border-brand-accent transition-colors shadow-sm">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — generate questions, plan lessons, create rubrics..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-brand placeholder-[#9b9590] outline-none resize-none leading-relaxed min-h-[22px] max-h-[150px] overflow-y-auto"
              style={{ height: '22px' }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {loading ? (
                <button
                  onClick={stopGeneration}
                  className="w-9 h-9 bg-[#fdeaea] hover:bg-[#f0b0b0] border border-[#f0b0b0] rounded-xl flex items-center justify-center text-[#b02020] transition-all"
                  title="Stop generating"
                >
                  ⏹
                </button>
              ) : (
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-brand hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-all active:scale-95"
                  title="Send message (Enter)"
                >
                  ↑
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[#9b9590] text-center mt-2">
            Powered by Groq · Llama 3.3 70B · Press <kbd className="bg-[#f0ede8] px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send · <kbd className="bg-[#f0ede8] px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </AppShell>
  );
}
