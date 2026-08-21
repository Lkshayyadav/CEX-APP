import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import { APP_CONFIG } from "../constants/config";

type MessageCallback = (data: any) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<MessageCallback>> = new Map();
  private activeSubscriptions: Set<string> = new Set();
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  public isConnected = false;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        console.log("[WebSocket] App foregrounded. Reconnecting WebSocket...");
        this.isExplicitlyClosed = false;
        this.connect();
      } else if (nextState === "background" || nextState === "inactive") {
        console.log("[WebSocket] App backgrounded. Closing WebSocket to save battery/data...");
        this.isExplicitlyClosed = true;
        this.disconnect();
      }
    });
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      console.log("[WebSocket] Connecting to:", APP_CONFIG.wsUrl);
      const ws = new WebSocket(APP_CONFIG.wsUrl);
      this.socket = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Active & Connected to Render CEX Engine");
        this.isConnected = true;
        this.notifyConnectionState(true);

        // Resubscribe to all active channels on reconnect
        if (this.activeSubscriptions.size > 0) {
          const channels = Array.from(this.activeSubscriptions);
          ws.send(
            JSON.stringify({
              method: "SUBSCRIBE",
              params: channels,
            })
          );
          console.log("[WebSocket] Resubscribed to channels:", channels);
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { stream, data } = parsed;
          if (stream) {
            const streamListeners = this.listeners.get(stream);
            if (streamListeners) {
              streamListeners.forEach((cb) => cb(data));
            }
          }
        } catch (err) {
          console.error("[WebSocket] Failed to parse message:", err);
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Connection closed.");
        this.isConnected = false;
        this.notifyConnectionState(false);
        this.socket = null;

        if (!this.isExplicitlyClosed) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };

      ws.onerror = (err) => {
        console.warn("[WebSocket] Error occurred:", err);
        this.socket?.close();
      };
    } catch (err) {
      console.error("[WebSocket] Setup failed:", err);
      if (!this.isExplicitlyClosed) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyConnectionState(false);
    clearTimeout(this.reconnectTimer);
  }

  public subscribe(channel: string, callback: MessageCallback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    if (!this.activeSubscriptions.has(channel)) {
      this.activeSubscriptions.add(channel);
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: [channel],
          })
        );
        console.log("[WebSocket] Subscribed to channel:", channel);
      } else {
        this.connect();
      }
    }
  }

  public unsubscribe(channel: string, callback: MessageCallback) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.delete(callback);
      if (channelListeners.size === 0) {
        this.listeners.delete(channel);
        this.activeSubscriptions.delete(channel);

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(
            JSON.stringify({
              method: "UNSUBSCRIBE",
              params: [channel],
            })
          );
          console.log("[WebSocket] Unsubscribed from channel:", channel);
        }
      }
    }
  }

  public onConnectionChange(cb: (connected: boolean) => void) {
    this.connectionListeners.add(cb);
    cb(this.isConnected);
    return () => {
      this.connectionListeners.delete(cb);
    };
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((cb) => cb(connected));
  }
}

export const wsManager = new WebSocketManager();

/**
 * Hook to track global WebSocket connection state
 */
export const useWebSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(wsManager.isConnected);

  useEffect(() => {
    wsManager.connect();
    const unsub = wsManager.onConnectionChange(setIsConnected);
    return unsub;
  }, []);

  return isConnected;
};

/**
 * Hook to subscribe to a specific channel stream (e.g. depth:BTC_USDT, trade:BTC_USDT)
 */
export const useWebSocketStream = (channel: string | null, onMessage: MessageCallback) => {
  const callbackRef = useRef<MessageCallback>(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!channel) return;

    const listener = (data: any) => {
      callbackRef.current(data);
    };

    wsManager.subscribe(channel, listener);
    return () => {
      wsManager.unsubscribe(channel, listener);
    };
  }, [channel]);
};
