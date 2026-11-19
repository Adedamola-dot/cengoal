import { create } from 'zustand';
import type { Role, CourseLevel } from '@cpe-os/shared';

interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  level?: CourseLevel;
  department: string;
  reputationPoints: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}));