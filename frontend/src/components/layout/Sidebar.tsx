'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: '⊞' },
  { label: 'My Groups', href: '/groups', icon: '◫' },
  { label: 'Assignments', href: '/assignments', icon: '☰' },
  { label: "AI Teacher's Toolkit", href: '/toolkit', icon: '✦' },
  { label: 'My Library', href: '/library', icon: '⊟' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { assignments, settings } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/assignments') return pathname.startsWith('/assignments') || pathname === '/';
    return pathname === href;
  };

  return (
    <aside className="w-[304px] bg-white rounded-2xl shadow-realistic flex flex-col flex-shrink-0 select-none p-6 justify-between h-[calc(100vh-24px)] sticky top-3">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-bold font-display text-lg">
            V
          </div>
          <span className="font-sans font-bold text-[20px] tracking-tight text-brand">VedaAI</span>
        </div>

        {/* AI Teacher's Toolkit Badge/Button */}
        <Link href="/toolkit">
          <div className="w-full bg-brand text-white border-2 border-brand-accent py-2.5 px-4 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 mb-6 hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm">
            <span className="text-brand-accent">✦</span>
            AI Teacher's Toolkit
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={clsx(
                    'px-4 py-3 rounded-xl text-[14px] flex items-center gap-3.5 cursor-pointer transition-all',
                    active
                      ? 'bg-[#f0ede8] text-brand font-bold shadow-sm'
                      : 'text-[#6b6660] hover:bg-surface-2 hover:text-brand'
                  )}
                >
                  <span className={clsx("text-base w-5 text-center", active ? "text-brand" : "text-[#9b9590]")}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === 'Assignments' && assignments.length > 0 && (
                    <span className="ml-auto bg-brand-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {assignments.length}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings + School Card */}
      <div className="flex flex-col gap-4">
        <Link href="/settings">
          <div className="px-4 py-2.5 text-[14px] text-[#6b6660] flex items-center gap-3.5 cursor-pointer hover:bg-surface-2 rounded-xl transition-colors">
            <span className="text-[#9b9590] text-base w-5 text-center">⚙</span>
            Settings
          </div>
        </Link>
        
        <div className="flex items-center gap-3 p-3.5 bg-[#f9f8f5] border border-[#e8e5df] rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-white border border-[#e8e5df] flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
            🟢
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold leading-tight text-brand truncate">{settings?.schoolName || 'Delhi Public School'}</div>
            <div className="text-[11px] text-[#9b9590] truncate">{settings?.schoolBranch || 'Bokaro Steel City'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
