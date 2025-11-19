import api from '../lib/api';

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  status: 'active' | 'completed' | 'archived';
  members: string[];
  todoCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  getProjects: async (status?: string) => {
    const response = await api.get<{ success: boolean; data: Project[]; count: number }>('/projects', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Project & { todos: any[] } }>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: Partial<Project>) => {
    const response = await api.post<{ success: boolean; data: Project }>('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const response = await api.put<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/projects/${id}`);
    return response.data;
  },
};
