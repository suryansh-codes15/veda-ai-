'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, Button } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const { assignments } = useAppStore();

  // Pick the latest 3 assignments
  const recentAssignments = assignments.slice(0, 3);

  // Stats calculation
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const pendingAssignments = assignments.filter((a) => a.status === 'processing' || a.status === 'pending').length;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand to-neutral-800 text-white rounded-3xl p-8 md:p-10 shadow-realistic border border-white/10">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block bg-brand-accent/25 border border-brand-accent/30 text-brand-accent px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              Overview
            </span>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight leading-tight mb-3">
              Generate pixel-perfect class assessments with AI
            </h1>
            <p className="text-[#c1bcba] text-[14px] leading-relaxed mb-6">
              Create structured question papers, homework sheets, and curriculum aligned assessments in seconds. Powered by advanced llama models.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/create">
                <Button variant="ghost" className="rounded-full bg-white text-[#1a1a1a] hover:bg-neutral-100 font-bold px-6 py-2.5">
                  ✦ Create Assessment
                </Button>
              </Link>
              <Link href="/toolkit">
                <Button variant="ghost" className="rounded-full border border-white/20 text-white hover:bg-white/10 px-6 py-2.5">
                  AI Teacher's Chat
                </Button>
              </Link>
            </div>
          </div>
          {/* Background decorative element */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-accent/10 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-6 border border-[#e8e5df] bg-[#fdfdfc] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[13px] font-medium text-[#9b9590]">Total Assessments</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-brand">{totalAssignments}</span>
              <span className="text-xs text-neutral-400">created</span>
            </div>
          </Card>
          <Card className="p-6 border border-[#e8e5df] bg-[#fdfdfc] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[13px] font-medium text-[#9b9590]">Completed Papers</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-emerald-600">{completedAssignments}</span>
              <span className="text-xs text-neutral-400">ready</span>
            </div>
          </Card>
          <Card className="p-6 border border-[#e8e5df] bg-[#fdfdfc] rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[13px] font-medium text-[#9b9590]">Processing Queue</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-[#b97d26]">{pendingAssignments}</span>
              <span className="text-xs text-neutral-400">running</span>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Recents Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Assessments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-[18px] text-brand">Recent Assessments</h2>
              <Link href="/assignments" className="text-[13px] text-brand font-semibold hover:underline">
                View all →
              </Link>
            </div>

            {recentAssignments.length === 0 ? (
              <div className="border border-dashed border-[#e8e5df] rounded-2xl p-8 text-center bg-[#fdfdfc]">
                <p className="text-[14px] text-[#9b9590]">No assessments created yet</p>
                <Link href="/create" className="inline-block mt-3 text-[13px] text-brand font-bold hover:underline">
                  Create your first assessment now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAssignments.map((a) => (
                  <Link href={`/output/${a._id}`} key={a._id} className="block">
                    <div className="p-4 border border-[#e8e5df] bg-[#fdfdfc] hover:bg-neutral-50 rounded-xl transition-all flex items-center justify-between shadow-sm hover:shadow">
                      <div>
                        <h3 className="font-bold text-[14px] text-brand">{a.subject}</h3>
                        <p className="text-[12px] text-[#9b9590] mt-0.5">
                          Grade {a.grade} • {a.generatedPaper?.timeAllowed || '60 mins'} • {a.generatedPaper?.maxMarks || 100} Marks
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        a.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-[18px] text-brand">Quick Tools</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/toolkit" className="p-4 border border-[#e8e5df] bg-[#fdfdfc] hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-3.5 shadow-sm">
                <span className="text-xl">✦</span>
                <div>
                  <h4 className="font-bold text-[13px] text-brand">AI Teacher's Toolkit</h4>
                  <p className="text-[11px] text-[#9b9590]">Ask curriculum design questions, get ideas</p>
                </div>
              </Link>
              <Link href="/groups" className="p-4 border border-[#e8e5df] bg-[#fdfdfc] hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-3.5 shadow-sm">
                <span className="text-xl">◫</span>
                <div>
                  <h4 className="font-bold text-[13px] text-brand">Classroom Groups</h4>
                  <p className="text-[11px] text-[#9b9590]">Organize your student classes & sections</p>
                </div>
              </Link>
              <Link href="/library" className="p-4 border border-[#e8e5df] bg-[#fdfdfc] hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-3.5 shadow-sm">
                <span className="text-xl">⊟</span>
                <div>
                  <h4 className="font-bold text-[13px] text-brand">Content Library</h4>
                  <p className="text-[11px] text-[#9b9590]">View templates and curriculum files</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
