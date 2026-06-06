import { DifficultyBadge } from '@/components/ui';
import type { GeneratedPaper } from '@shared/types';

interface PaperRendererProps {
  paper: GeneratedPaper;
}

export function PaperRenderer({ paper }: PaperRendererProps) {
  let qNum = 1;

  return (
    <div className="bg-white border border-[#e8e5df] rounded-2xl px-10 py-9 font-sans">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="text-[17px] font-bold tracking-tight">{paper.schoolName}</h2>
        <p className="text-[13px] text-[#6b6660] mt-1">
          Subject: {paper.subject} &nbsp;|&nbsp; Class: {paper.grade}
        </p>
      </div>

      <hr className="border-brand border-t-2 mb-3" />

      <div className="flex justify-between text-[12px] text-[#6b6660] mb-1.5">
        <span>
          Time Allowed: <strong className="text-brand">{paper.timeAllowed}</strong>
        </span>
        <span>
          Maximum Marks: <strong className="text-brand">{paper.maxMarks}</strong>
        </span>
      </div>

      <p className="text-[11px] text-[#9b9590] italic text-center mb-5">
        All questions are compulsory unless stated otherwise.
      </p>

      <hr className="border-[#e8e5df] mb-5" />

      {/* Student info */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {['Name', 'Roll Number', 'Section'].map((label) => (
          <div key={label}>
            <p className="text-[11px] text-[#9b9590] mb-1">{label}</p>
            <input
              type="text"
              className="w-full border-b border-[#d4d0c8] outline-none text-[13px] bg-transparent pb-1 focus:border-brand transition-colors"
              placeholder="_______________________"
            />
          </div>
        ))}
      </div>

      {/* Sections */}
      {paper.sections.map((section) => (
        <div key={section.title} className="mb-7">
          <div className="mb-2.5">
            <h3 className="text-[15px] font-bold border-b-[1.5px] border-brand pb-1.5 mb-1">
              {section.title}
            </h3>
            <p className="text-[12px] text-[#6b6660] italic">{section.instruction}</p>
          </div>

          <div className="space-y-4">
            {section.questions.map((q) => {
              const num = qNum++;
              return (
                <div key={q.id} className="flex gap-3">
                  <span className="text-[13px] font-semibold text-brand min-w-[22px] mt-0.5">
                    {num}.
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] leading-relaxed mb-2">{q.question}</p>

                    {/* MCQ options */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-2 ml-1">
                        {q.options.map((opt, oi) => (
                          <p key={oi} className="text-[12px] text-[#6b6660]">
                            ({String.fromCharCode(97 + oi)}) {opt}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="text-[11px] text-[#9b9590] ml-auto">
                        [{q.marks} mark{q.marks > 1 ? 's' : ''}]
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Answer Key */}
      <div className="mt-8 pt-6 border-t-2 border-[#e8e5df]">
        <h3 className="text-[14px] font-bold mb-4">Answer Key</h3>
        <div className="space-y-2.5">
          {(() => {
            let n = 1;
            return paper.sections.flatMap((sec) =>
              sec.questions.map((q) => (
                <div key={q.id} className="flex gap-2.5 text-[12px] leading-relaxed">
                  <span className="font-semibold text-[#9b9590] min-w-[20px]">{n++}.</span>
                  <span className="text-[#6b6660]">{q.answer}</span>
                </div>
              ))
            );
          })()}
        </div>
      </div>
    </div>
  );
}
