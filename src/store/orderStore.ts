import { create } from "zustand";
import { Order } from "../types";
import { orderApi, CreateOrderPayload } from "../api/order.api";
import { getErrorMessage } from "../utils/errorHandler";
import * as Haptics from "expo-haptics";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;

  fetchOrders: () => Promise<void>;
  placeOrder: (payload: CreateOrderPayload) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  clearFeedback: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,

  clearFeedback: () => set({ error: null, successMessage: null }),

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await orderApi.getUserOrders();
      set({ orders: data, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  placeOrder: async (payload: CreateOrderPayload) => {
    set({ isSubmitting: true, error: null, successMessage: null });
    try {
      const newOrder = await orderApi.createOrder(payload);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      set((state) => ({
        orders: [newOrder, ...state.orders],
        isSubmitting: false,
        successMessage: `${payload.side} order placed for ${payload.quantity} ${payload.marketSymbol.split("/")[0]}`,
      }));
      return true;
    } catch (err) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}

      const msg = getErrorMessage(err, "Order placement failed. Check your free balance.");
      set({ error: msg, isSubmitting: false });
      return false;
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      await orderApi.cancelOrder(orderId);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
      }));
      return true;
    } catch (err) {
      set({ error: getErrorMessage(err, "Failed to cancel order.") });
      return false;
    }
  },
}));
