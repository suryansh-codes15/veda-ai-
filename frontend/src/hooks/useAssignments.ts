'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { assignmentService } from '@/services/api';

export function useAssignments() {
  const { assignments, setAssignments, addAssignment, updateAssignment, removeAssignment } =
    useAppStore();

  const fetchAssignments = useCallback(async () => {
    try {
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  }, [setAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const deleteAssignment = useCallback(
    async (id: string) => {
      try {
        await assignmentService.delete(id);
        removeAssignment(id);
      } catch (err) {
        console.error('Failed to delete assignment:', err);
        throw err;
      }
    },
    [removeAssignment]
  );

  return { assignments, fetchAssignments, deleteAssignment, updateAssignment };
}
