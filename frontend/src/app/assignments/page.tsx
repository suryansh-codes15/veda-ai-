'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button, Alert } from '@/components/ui';
import { useAssignments } from '@/hooks/useAssignments';
import { useAppStore } from '@/store/useAppStore';
import type { Assignment } from '../../../shared/types';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] text-center">
      <div className="relative w-[120px] h-[120px] mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[90px] h-[110px] bg-[#e8e5df] rounded-xl relative">
            <div className="absolute top-4 left-4 right-4 space-y-2">
              <div className="h-2 bg-[#c8c4bc] rounded-full" />
              <div className="h-2 bg-[#c8c4bc] rounded-full w-3/4" />
              <div className="h-2 bg-[#c8c4bc] rounded-full w-1/2" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-[#e8e5df] rounded-full flex items-center justify-center">
          <div className="relative">
            <span className="text-2xl">🔍</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">✕</span>
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-[18px] font-semibold mb-2">No assignments yet</h2>
      <p className="text-[13px] text-[#6b6660] max-w-[340px] leading-relaxed mb-6">
        Create your first assignment to start collecting and grading student submissions. You can set
        up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link href="/create">
        <Button size="lg" className="rounded-full px-7 py-3.5 bg-brand hover:bg-neutral-800 text-white font-bold transition-all shadow-sm">
          + Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}

function AssignmentCard({ assignment, onDelete, onView }: {
  assignment: Assignment;
  onDelete: (id: string) => void;
  onView: (assignment: Assignment) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setMenuOpen(false);
    await onDelete(assignment._id);
    setDeleting(false);
  };

  const assigned = new Date(assignment.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '-');

  const due = new Date(assignment.dueDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <div
      className="bg-white border border-[#e8e5df] rounded-2xl p-5 cursor-pointer hover:border-[#d4d0c8] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative"
      onClick={() => onView(assignment)}
    >
      <button
        className="absolute top-4 right-4 text-[#9b9590] hover:text-[#6b6660] p-1 rounded"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      >
        ⋮
      </button>
      {menuOpen && (
        <div
          className="absolute top-10 right-4 bg-white border border-[#e8e5df] rounded-xl shadow-lg z-20 min-w-[150px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full text-left px-4 py-2.5 text-[13px] hover:bg-surface-3 transition-colors"
            onClick={() => { setMenuOpen(false); onView(assignment); }}
          >
            View Assignment
          </button>
          <button
            className="block w-full text-left px-4 py-2.5 text-[13px] text-brand-accent hover:bg-[#fff7f3] transition-colors"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
      <div
        className="text-[15px] font-semibold pr-6 mb-1"
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {assignment.subject} — {assignment.grade}
      </div>
      <div className="flex items-center gap-2 mt-4">
        {assignment.status === 'completed' ? (
          <span className="text-[10px] font-semibold bg-[#e8f5ee] text-[#2d7a4f] px-2 py-0.5 rounded-full">Completed</span>
        ) : assignment.status === 'processing' ? (
          <span className="text-[10px] font-semibold bg-[#fff3e0] text-[#b85c00] px-2 py-0.5 rounded-full">Processing</span>
        ) : assignment.status === 'failed' ? (
          <span className="text-[10px] font-semibold bg-[#fdeaea] text-[#b02020] px-2 py-0.5 rounded-full">Failed</span>
        ) : null}
      </div>
      <div className="text-[12px] text-[#9b9590] mt-3">
        Assigned on: <span className="text-[#6b6660] font-medium">{assigned}</span>{' '}
        &nbsp; Due: <span className="text-[#6b6660] font-medium">{due}</span>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments, deleteAssignment } = useAssignments();
  const { setActivePaper } = useAppStore();
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const filtered = assignments.filter((a) =>
    `${a.subject} ${a.grade}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteAssignment(id);
    } catch {
      setDeleteError('Failed to delete assignment. Please try again.');
    }
  };

  const handleView = (assignment: Assignment) => {
    if (assignment.status === 'completed' && assignment.generatedPaper) {
      setActivePaper(assignment.generatedPaper, assignment._id);
      router.push(`/output/${assignment._id}`);
    }
  };

  return (
    <AppShell title="Assignment">
      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-[22px] font-bold">Assignments</h1>
            <p className="text-[13px] text-[#6b6660] mt-0.5">
              Manage and create assignments for your classes.
            </p>
          </div>

          {deleteError && (
            <Alert type="error" message={deleteError} onClose={() => setDeleteError('')} />
          )}

          <div className="flex items-center gap-3 mb-5">
            <button className="flex items-center gap-2 px-3.5 py-2.5 border border-[#e8e5df] rounded-lg text-[13px] text-[#6b6660] bg-white hover:border-[#d4d0c8] transition-colors">
              ⧈ Filter by
            </button>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9590] text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#e8e5df] rounded-lg text-[13px] bg-white outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filtered.map((a) => (
              <AssignmentCard
                key={a._id}
                assignment={a}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/create">
              <Button size="lg" className="rounded-full px-7 py-3.5 bg-brand hover:bg-neutral-800 text-white font-bold transition-all shadow-sm">
                + Create Assignment
              </Button>
            </Link>
          </div>
        </>
      )}
    </AppShell>
  );
}
