import api from '../lib/api';

export interface Tag {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  count?: number;
  createdAt: string;
  updatedAt: string;
}

export const tagService = {
  getTags: async () => {
    const response = await api.get<{ success: boolean; data: Tag[]; count: number }>('/tags');
    return response.data;
  },

  getTag: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Tag }>(`/tags/${id}`);
    return response.data;
  },

  createTag: async (data: Partial<Tag>) => {
    const response = await api.post<{ success: boolean; data: Tag }>('/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: Partial<Tag>) => {
    const response = await api.put<{ success: boolean; data: Tag }>(`/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/tags/${id}`);
    return response.data;
  },
};
