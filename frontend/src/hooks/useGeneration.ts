'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { assignmentService } from '@/services/api';
import { subscribeToAssignment } from '@/services/socket';
import type { CreateAssignmentDTO } from '@shared/types';

export function useGeneration() {
  const router = useRouter();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const {
    startGeneration,
    setGenerationProgress,
    setGenerationStatus,
    setActivePaper,
    addAssignment,
    updateAssignment,
  } = useAppStore();

  const generate = useCallback(
    async (dto: CreateAssignmentDTO, file?: File | null) => {
      try {
        // Create assignment and get job ID
        const { assignmentId } = await assignmentService.create(dto, file);
        startGeneration(assignmentId);

        // Subscribe to WebSocket events for this assignment
        const unsubscribe = subscribeToAssignment(
          assignmentId,
          // onProgress
          ({ progress, stage }) => {
            setGenerationProgress(progress, stage);
            setGenerationStatus('processing');
          },
          // onComplete
          ({ paper }) => {
            setGenerationStatus('completed');
            setActivePaper(paper, assignmentId);
            updateAssignment(assignmentId, {
              status: 'completed',
              generatedPaper: paper,
            });
            if (unsubscribeRef.current) unsubscribeRef.current();
            router.push(`/output/${assignmentId}`);
          },
          // onFailed
          ({ error }) => {
            setGenerationStatus('failed', error);
            if (unsubscribeRef.current) unsubscribeRef.current();
          }
        );

        unsubscribeRef.current = unsubscribe;

        // Navigate to generating page
        router.push('/generating');
      } catch (err: any) {
        setGenerationStatus('failed', err.message || 'Failed to start generation');
        throw err;
      }
    },
    [router, startGeneration, setGenerationProgress, setGenerationStatus, setActivePaper, updateAssignment]
  );

  const regenerate = useCallback(
    async (assignmentId: string) => {
      try {
        await assignmentService.regenerate(assignmentId);
        startGeneration(assignmentId);

        const unsubscribe = subscribeToAssignment(
          assignmentId,
          ({ progress, stage }) => {
            setGenerationProgress(progress, stage);
            setGenerationStatus('processing');
          },
          ({ paper }) => {
            setGenerationStatus('completed');
            setActivePaper(paper, assignmentId);
            updateAssignment(assignmentId, { status: 'completed', generatedPaper: paper });
            if (unsubscribeRef.current) unsubscribeRef.current();
          },
          ({ error }) => {
            setGenerationStatus('failed', error);
            if (unsubscribeRef.current) unsubscribeRef.current();
          }
        );

        unsubscribeRef.current = unsubscribe;
        router.push('/generating');
      } catch (err: any) {
        setGenerationStatus('failed', err.message);
        throw err;
      }
    },
    [router, startGeneration, setGenerationProgress, setGenerationStatus, setActivePaper, updateAssignment]
  );

  return { generate, regenerate };
}
