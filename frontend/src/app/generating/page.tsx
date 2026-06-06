'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const GEN_STAGES = [
  { label: 'Sending to AI engine', threshold: 0 },
  { label: 'Analyzing requirements', threshold: 25 },
  { label: 'Generating questions', threshold: 50 },
  { label: 'Structuring sections', threshold: 70 },
  { label: 'Saving to database', threshold: 85 },
  { label: 'Complete!', threshold: 100 },
];

export default function GeneratingPage() {
  const router = useRouter();
  const { generation } = useAppStore();

  useEffect(() => {
    // If somehow landed here with no active job, redirect
    if (generation.status === 'idle') {
      router.replace('/assignments');
    }
    if (generation.status === 'completed' && generation.assignmentId) {
      router.replace(`/output/${generation.assignmentId}`);
    }
  }, [generation.status, generation.assignmentId, router]);

  const progress = generation.progress;

  return (
    <AppShell title="Generating Paper">
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        {generation.status === 'failed' ? (
          <>
            <div className="text-5xl mb-5">⚠️</div>
            <h2 className="text-[20px] font-semibold mb-2">Generation Failed</h2>
            <p className="text-[13px] text-[#6b6660] max-w-[300px] mb-6">
              {generation.error || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={() => router.push('/create')}
              className="bg-brand text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            {/* Spinner */}
            <div className="relative w-16 h-16 mb-7">
              <div className="absolute inset-0 border-[3px] border-[#e8e5df] rounded-full" />
              <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-accent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-brand">
                {Math.round(progress)}%
              </div>
            </div>

            <h2 className="text-[20px] font-semibold mb-2">Generating your question paper...</h2>
            <p className="text-[13px] text-[#6b6660] max-w-[300px] mb-7 leading-relaxed">
              Our AI is crafting a perfectly structured assessment. This may take a moment.
            </p>

            {/* Progress bar */}
            <div className="w-[300px] h-1.5 bg-[#e8e5df] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-brand-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[12px] text-[#9b9590] mb-8">{generation.stage}</p>

            {/* Step list */}
            <div className="text-left w-[240px] space-y-2">
              {GEN_STAGES.map((s, i) => {
                const done = progress >= s.threshold && progress > 0;
                const active = progress >= s.threshold && (i === GEN_STAGES.length - 1 ? progress >= 100 : progress < GEN_STAGES[i + 1].threshold);
                return (
                  <div
                    key={s.label}
                    className={clsx(
                      'flex items-center gap-2.5 text-[13px] transition-colors',
                      done ? 'text-easy' : active ? 'text-brand font-medium' : 'text-[#9b9590]'
                    )}
                  >
                    <span className="text-[15px]">
                      {done ? '✓' : active ? '◈' : '○'}
                    </span>
                    {s.label}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
