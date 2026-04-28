import { create } from 'zustand';
import { classroomApi } from '@/features/classroom/api';
import type { Classroom } from '@/features/classroom/types';

interface ClassroomStore {
  classrooms: Classroom[];
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  invalidate: () => void;
}

export const useClassroomStore = create<ClassroomStore>((set, get) => ({
  classrooms: [],
  loaded: false,
  loading: false,

  fetch: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const classrooms = await classroomApi.list();
      set({ classrooms, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  invalidate: () => set({ classrooms: [], loaded: false }),
}));
