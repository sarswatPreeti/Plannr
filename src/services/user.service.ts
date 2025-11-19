import api from '../lib/api';
import { User } from './auth.service';

export interface UserStats {
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  totalProjects: number;
  todosToday: number;
  todosByPriority: {
    low?: number;
    medium?: number;
    high?: number;
  };
}

export const userService = {
  getProfile: async () => {
    const response = await api.get<{ success: boolean; data: User }>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<{ success: boolean; data: User }>('/users/profile', data);
    return response.data;
  },

  updatePreferences: async (preferences: Partial<User['preferences']>) => {
    const response = await api.put<{ success: boolean; data: User }>('/users/preferences', preferences);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get<{ success: boolean; data: UserStats }>('/users/stats');
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete<{ success: boolean; message: string }>('/users/profile');
    return response.data;
  }
};
