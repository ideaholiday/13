import { apiClient } from '../api-client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/lib/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Login failed');
    }
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/register', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Registration failed');
    }
    return response.data;
  },
  logout: async (): Promise<void> => {
    const response = await apiClient.post<void>('/logout', {});
    if (!response.success) {
      // Even if logout fails, we can proceed on the client side.
      // The token will just be invalid on the server.
      console.warn('Logout API call failed', response.error);
    }
  },
  getUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/user');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user');
    }
    return response.data;
  },
};
