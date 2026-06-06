'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button, Input, Textarea, Alert, Card } from '@/components/ui';
import { useGeneration } from '@/hooks/useGeneration';
import type { CreateAssignmentDTO, QuestionTypeConfig, QuestionType } from '@shared/types';
import clsx from 'clsx';

const QUESTION_TYPES: QuestionType[] = [
  'Multiple Choice Questions',
  'Short Answer Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False Questions',
  'Fill in the Blanks',
  'Match the Following',
];

function StepIndicator({ current }: { current: number }) {
  const steps = ['Assignment Details', 'Review', 'Generate'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center text-[12px] font-semibold transition-all',
                  done && 'border-easy bg-easy text-white',
                  active && 'border-brand bg-brand text-white',
                  !done && !active && 'border-[#e8e5df] text-[#9b9590]'
                )}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={clsx(
                  'text-[12px] font-medium transition-colors',
                  done && 'text-easy',
                  active && 'text-brand',
                  !done && !active && 'text-[#9b9590]'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'h-px flex-1 mx-3 w-16 transition-colors',
                  done ? 'bg-easy' : 'bg-[#e8e5df]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuestionTypeRow({
  qt, index, total, onChange, onRemove,
}: {
  qt: QuestionTypeConfig;
  index: number;
  total: number;
  onChange: (i: number, field: keyof QuestionTypeConfig, val: string | number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center p-3.5 bg-surface-2 border border-[#e8e5df] rounded-xl mb-2.5">
      <select
        value={qt.type}
        onChange={(e) => onChange(index, 'type', e.target.value)}
        className="px-3 py-2 border border-[#e8e5df] rounded-lg text-[13px] bg-white outline-none focus:border-brand"
      >
        {QUESTION_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(index, 'count', Math.max(1, qt.count - 1))}
          className="w-7 h-7 border border-[#e8e5df] rounded-lg bg-white text-[#6b6660] hover:bg-surface-3 flex items-center justify-center text-sm transition-colors"
        >
          −
        </button>
        <span className="min-w-[28px] text-center text-[14px] font-semibold">{qt.count}</span>
        <button
          type="button"
          onClick={() => onChange(index, 'count', Math.min(50, qt.count + 1))}
          className="w-7 h-7 border border-[#e8e5df] rounded-lg bg-white text-[#6b6660] hover:bg-surface-3 flex items-center justify-center text-sm transition-colors"
        >
          +
        </button>
        <span className="text-[11px] text-[#9b9590] ml-1">Qs</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(index, 'marks', Math.max(1, qt.marks - 1))}
          className="w-7 h-7 border border-[#e8e5df] rounded-lg bg-white text-[#6b6660] hover:bg-surface-3 flex items-center justify-center text-sm transition-colors"
        >
          −
        </button>
        <span className="min-w-[28px] text-center text-[14px] font-semibold">{qt.marks}</span>
        <button
          type="button"
          onClick={() => onChange(index, 'marks', Math.min(20, qt.marks + 1))}
          className="w-7 h-7 border border-[#e8e5df] rounded-lg bg-white text-[#6b6660] hover:bg-surface-3 flex items-center justify-center text-sm transition-colors"
        >
          +
        </button>
        <span className="text-[11px] text-[#9b9590] ml-1">marks</span>
      </div>

      {total > 1 && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-[#9b9590] hover:text-brand-accent p-1 rounded transition-colors text-sm"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function UploadZone({ file, onFile }: { file: File | null; onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        dragging ? 'border-brand-accent bg-brand-light' : 'border-[#d4d0c8] bg-surface-2 hover:border-brand-accent hover:bg-brand-light'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="text-3xl mb-3">☁</div>
      {file ? (
        <p className="text-[13px] text-easy font-medium">✓ {file.name}</p>
      ) : (
        <>
          <p className="text-[13px] text-[#6b6660] mb-1">
            Choose a file or drag & drop it here
          </p>
          <p className="text-[11px] text-[#9b9590] mb-3">JPEG, PNG, PDF, up to 5MB</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
            className="px-4 py-1.5 border border-[#d4d0c8] rounded-lg text-[12px] bg-white hover:bg-surface-3 transition-colors"
          >
            Browse Files
          </button>
        </>
      )}
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const { generate } = useGeneration();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Answer Questions', count: 3, marks: 2 },
  ]);

  const totalQuestions = questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marks, 0);

  const handleQTChange = useCallback(
    (i: number, field: keyof QuestionTypeConfig, val: string | number) => {
      setQuestionTypes((prev) =>
        prev.map((qt, idx) => (idx === i ? { ...qt, [field]: val } : qt))
      );
    },
    []
  );

  const handleAddQT = () => {
    const used = questionTypes.map((q) => q.type);
    const avail = QUESTION_TYPES.filter((t) => !used.includes(t));
    if (!avail.length) return;
    setQuestionTypes((prev) => [...prev, { type: avail[0], count: 3, marks: 2 }]);
  };

  const handleRemoveQT = useCallback((i: number) => {
    setQuestionTypes((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const validateStep1 = () => {
    if (!subject.trim()) return 'Please enter a subject.';
    if (!grade.trim()) return 'Please enter a class/grade.';
    if (!dueDate) return 'Please select a due date.';
    if (questionTypes.length === 0) return 'Please add at least one question type.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const dto: CreateAssignmentDTO = {
        subject: subject.trim(),
        grade: grade.trim(),
        dueDate,
        questionTypes,
        additionalInstructions: additionalInstructions.trim() || undefined,
      };
      await generate(dto, file);
    } catch (err: any) {
      setError(err.message || 'Failed to start generation.');
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Assignment" showBack onBack={() => router.push('/assignments')}>
      <div className="max-w-[700px]">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold">Create Assignment</h1>
          <p className="text-[13px] text-[#6b6660] mt-0.5">Set up a new assignment for your students</p>
        </div>

        <StepIndicator current={step} />

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <Card title="Assignment Details" subtitle="Basic information about your assignment">
              <UploadZone file={file} onFile={setFile} />
              <p className="text-[11px] text-[#9b9590] mt-2 mb-5">
                Upload images of your preferred document/image
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-medium mb-1.5">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 pr-10 border border-[#e8e5df] rounded-lg text-[13px] bg-white outline-none focus:border-brand transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9590] pointer-events-none">📅</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <Input
                  label="Subject"
                  placeholder="e.g. Science, Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Input
                  label="Class / Grade"
                  placeholder="e.g. Class 8, Grade 5"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>

              <div className="mb-1">
                <label className="block text-[13px] font-medium mb-3">
                  Question Type
                  <span className="text-[11px] font-normal text-[#9b9590] ml-2">
                    No. of Questions × Marks
                  </span>
                </label>
                {questionTypes.map((qt, i) => (
                  <QuestionTypeRow
                    key={i}
                    qt={qt}
                    index={i}
                    total={questionTypes.length}
                    onChange={handleQTChange}
                    onRemove={handleRemoveQT}
                  />
                ))}
                {questionTypes.length < QUESTION_TYPES.length && (
                  <button
                    type="button"
                    onClick={handleAddQT}
                    className="flex items-center gap-1.5 text-brand-accent text-[13px] font-medium mt-1 hover:opacity-80 transition-opacity"
                  >
                    ⊕ Add Question Type
                  </button>
                )}
              </div>

              <div className="text-right text-[13px] text-[#6b6660] mt-3">
                Total Questions: <strong className="text-brand">{totalQuestions}</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Total Marks: <strong className="text-brand">{totalMarks}</strong>
              </div>

              <div className="mt-5">
                <Textarea
                  label="Additional Information (For better output)"
                  placeholder="e.g. Generate a question paper for 3 hour exam duration, focus on NCERT chapters 4-6..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
              </div>
            </Card>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div className="flex items-center justify-between mt-5">
              <Button variant="secondary" onClick={() => router.push('/assignments')}>
                ← Previous
              </Button>
              <Button onClick={handleNext}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <Card title="Review Assignment" subtitle="Confirm the details before generating your question paper">
              <table className="w-full text-[13px] border-collapse">
                <tbody>
                  {[
                    ['Subject', subject],
                    ['Class / Grade', grade],
                    ['Due Date', dueDate],
                    ['Total Questions', String(totalQuestions)],
                    ['Total Marks', String(totalMarks)],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[#f0ede8]">
                      <td className="py-3 text-[#9b9590] w-40">{label}</td>
                      <td className="py-3 font-medium">{value}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-[#f0ede8]">
                    <td className="py-3 text-[#9b9590] align-top">Question Types</td>
                    <td className="py-3">
                      {questionTypes.map((qt) => (
                        <div key={qt.type} className="mb-1">
                          <span className="font-medium">{qt.type}</span>
                          <span className="text-[#9b9590] ml-2">
                            — {qt.count} question{qt.count > 1 ? 's' : ''} × {qt.marks} mark{qt.marks > 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                  {additionalInstructions && (
                    <tr>
                      <td className="py-3 text-[#9b9590] align-top">Instructions</td>
                      <td className="py-3 text-[#6b6660]">{additionalInstructions}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div className="flex items-center justify-between mt-5">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Previous
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                ✦ Generate Paper
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
