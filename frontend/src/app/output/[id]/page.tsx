'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button, Alert } from '@/components/ui';
import { PaperRenderer } from '@/components/paper/PaperRenderer';
import { useAppStore } from '@/store/useAppStore';
import { useGeneration } from '@/hooks/useGeneration';
import { assignmentService } from '@/services/api';
import type { GeneratedPaper } from '@shared/types';

export default function OutputPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { activePaper, activeAssignmentId, setActivePaper } = useAppStore();
  const { regenerate } = useGeneration();

  const [paper, setPaper] = useState<GeneratedPaper | null>(activePaper);
  const [loading, setLoading] = useState(!activePaper);
  const [success, setSuccess] = useState(true);
  const [error, setError] = useState('');
  const [regen, setRegen] = useState(false);

  useEffect(() => {
    if (!activePaper && id) {
      // Fetch from API if no paper in store
      assignmentService
        .getById(id)
        .then((a) => {
          if (a.generatedPaper) {
            setPaper(a.generatedPaper);
            setActivePaper(a.generatedPaper, id);
          } else {
            setError('Paper not yet generated.');
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const timer = setTimeout(() => setSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [id, activePaper, setActivePaper]);

  const handleRegenerate = async () => {
    if (!id) return;
    setRegen(true);
    setError('');
    try {
      await regenerate(id);
    } catch (e: any) {
      setError(e.message || 'Regeneration failed.');
      setRegen(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!id) return;
    const url = assignmentService.getPDFUrl(id);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <AppShell title="AI Teacher's Toolkit" showBack onBack={() => router.push('/assignments')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-[#e8e5df] border-t-brand-accent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!paper) {
    return (
      <AppShell title="AI Teacher's Toolkit" showBack onBack={() => router.push('/assignments')}>
        <Alert type="error" message={error || 'No paper found.'} />
        <Button variant="secondary" onClick={() => router.push('/assignments')}>
          ← Back to Assignments
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell title="AI Teacher's Toolkit" showBack onBack={() => router.push('/assignments')}>
      <div className="max-w-[860px]">
        {success && (
          <Alert
            type="success"
            message="Question paper generated successfully!"
            onClose={() => setSuccess(false)}
          />
        )}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] text-[#6b6660] mb-0.5">
              Certainly! Here is your customised Question Paper for your
            </p>
            <p className="text-[14px] font-semibold">
              {paper.grade} {paper.subject} classes on the NCERT chapters.
            </p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0 ml-5">
            <Button variant="secondary" onClick={handleRegenerate} loading={regen} size="sm">
              ↺ Regenerate
            </Button>
            <Button onClick={handleDownloadPDF} size="sm">
              ↓ Download as PDF
            </Button>
          </div>
        </div>

        <PaperRenderer paper={paper} />
      </div>
    </AppShell>
  );
}
