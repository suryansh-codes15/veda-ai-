'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface TopbarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Topbar({ title, showBack = false, onBack }: TopbarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <header className="bg-white/75 backdrop-blur-md rounded-2xl shadow-realistic h-14 flex items-center justify-between px-6 flex-shrink-0 select-none border border-white/40">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-brand font-bold hover:bg-surface-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-lg"
          >
            ←
          </button>
        )}
        <span className="text-[14px] font-semibold text-brand flex items-center gap-2">
          {!showBack && <span className="text-base text-[#9b9590]">⊞</span>}
          {title}
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative cursor-pointer text-brand text-[20px] hover:scale-105 active:scale-95 transition-all p-1.5 rounded-lg hover:bg-surface-2">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
        </div>
        <div className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-surface-2 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#e8d5c8] flex items-center justify-center text-[11px] font-bold text-[#b05a30] shadow-sm">
            JD
          </div>
          <span className="text-[13px] font-bold text-brand">John Doe</span>
          <span className="text-[11px] text-[#9b9590] font-bold">▼</span>
        </div>
      </div>
    </header>
  );
}
