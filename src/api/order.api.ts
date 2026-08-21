import { api } from "./client";
import { Order, OrderSide, OrderType, ApiResponse } from "../types";

export interface CreateOrderPayload {
  marketSymbol: string;
  side: OrderSide;
  type: OrderType;
  price?: string;
  quantity: string;
}

export const orderApi = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>("/orders", payload);
    return res.data.data;
  },

  async getUserOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>("/orders");
    return res.data.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const res = await api.delete<ApiResponse<Order>>(`/orders/${orderId}`);
    return res.data.data;
  },
};
