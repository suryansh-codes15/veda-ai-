import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Assignment, GeneratedPaper } from '@shared/types';

export interface GenerationState {
  assignmentId: string | null;
  progress: number;
  stage: string;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
}

export interface SchoolSettings {
  teacherName: string;
  schoolName: string;
  schoolBranch: string;
  defaultGrade: string;
}

interface AppState {
  // Assignments
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  removeAssignment: (id: string) => void;

  // Active paper (output view)
  activePaper: GeneratedPaper | null;
  activeAssignmentId: string | null;
  setActivePaper: (paper: GeneratedPaper | null, assignmentId?: string | null) => void;

  // Generation progress
  generation: GenerationState;
  setGenerationProgress: (progress: number, stage: string) => void;
  setGenerationStatus: (status: GenerationState['status'], error?: string | null) => void;
  startGeneration: (assignmentId: string) => void;
  resetGeneration: () => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Settings
  settings: SchoolSettings;
  updateSettings: (updates: Partial<SchoolSettings>) => void;
}


const initialGeneration: GenerationState = {
  assignmentId: null,
  progress: 0,
  stage: 'Initializing...',
  status: 'idle',
  error: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Assignments
        assignments: [],
        setAssignments: (assignments) => set({ assignments }),
        addAssignment: (assignment) =>
          set((s) => ({ assignments: [assignment, ...s.assignments] })),
        updateAssignment: (id, updates) =>
          set((s) => ({
            assignments: s.assignments.map((a) =>
              a._id === id ? { ...a, ...updates } : a
            ),
          })),
        removeAssignment: (id) =>
          set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) })),

        // Active paper
        activePaper: null,
        activeAssignmentId: null,
        setActivePaper: (paper, assignmentId = null) =>
          set({ activePaper: paper, activeAssignmentId: assignmentId }),

        // Generation
        generation: initialGeneration,
        setGenerationProgress: (progress, stage) =>
          set((s) => ({ generation: { ...s.generation, progress, stage } })),
        setGenerationStatus: (status, error = null) =>
          set((s) => ({ generation: { ...s.generation, status, error } })),
        startGeneration: (assignmentId) =>
          set({
            generation: {
              ...initialGeneration,
              assignmentId,
              status: 'pending',
            },
          }),
        resetGeneration: () => set({ generation: initialGeneration }),

        // UI
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        // Settings
        settings: {
          teacherName: 'Dr. Sarah Jenkins',
          schoolName: 'Delhi Public School',
          schoolBranch: 'Bokaro Steel City',
          defaultGrade: '10',
        },
        updateSettings: (updates) =>
          set((s) => ({ settings: { ...s.settings, ...updates } })),
      }),
      {
        name: 'vedaai-store',
        partialize: (state) => ({
          assignments: state.assignments,
          settings: state.settings,
        }),
      }
    )
  )
);

