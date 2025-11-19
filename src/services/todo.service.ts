import api from '../lib/api';

export interface Todo {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: string;
  icon?: string;
  completed: boolean;
  projectId?: string;
  tags: string[];
  subtasks: {
    title: string;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  status?: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  projectId?: string;
}

export const todoService = {
  getTodos: async (filters?: TodoFilters) => {
    const response = await api.get<{ success: boolean; data: Todo[]; count: number }>('/todos', {
      params: filters,
    });
    return response.data;
  },

  getTodo: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Todo }>(`/todos/${id}`);
    return response.data;
  },

  createTodo: async (data: Partial<Todo>) => {
    const response = await api.post<{ success: boolean; data: Todo }>('/todos', data);
    return response.data;
  },

  updateTodo: async (id: string, data: Partial<Todo>) => {
    const response = await api.put<{ success: boolean; data: Todo }>(`/todos/${id}`, data);
    return response.data;
  },

  deleteTodo: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/todos/${id}`);
    return response.data;
  },

  toggleTodo: async (id: string) => {
    const response = await api.patch<{ success: boolean; data: Todo }>(`/todos/${id}/toggle`);
    return response.data;
  },
};
