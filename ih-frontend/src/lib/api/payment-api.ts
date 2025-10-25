import { apiClient } from '../api-client';

interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, any>;
}

interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
}

export const paymentApi = {
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', data);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create payment order');
    }
    return response.data;
  },
};
