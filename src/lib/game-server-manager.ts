import { WebSocketManager } from './websocket/manager.ts';
import { MessageHandler } from './websocket/message-handler.ts';
import { minecraftState, abioticState } from './stores/stores.ts';
import type { Games } from './types.js';
import { get } from 'svelte/store';

export class GameServerManager {
  private messageHandler: MessageHandler;
  private minecraftWs: WebSocketManager | null = null;
  private abioticWs: WebSocketManager | null = null;
  private minecraftUrl: string;
  private abioticUrl: string;

  constructor() {
    this.messageHandler = new MessageHandler();

    const isLocal = import.meta.env.VITE_API_URL?.includes('localhost');
    const protocol = isLocal ? 'ws' : 'wss';
    const baseUrl = `${protocol}://${import.meta.env.VITE_API_URL}`;

    this.minecraftUrl = `${baseUrl}/minecraft`;
    this.abioticUrl = `${baseUrl}/abiotic`;
  }

  connect(): void {
    this.minecraftWs = new WebSocketManager('minecraft', this.minecraftUrl, this.messageHandler);
    this.abioticWs = new WebSocketManager('abiotic', this.abioticUrl, this.messageHandler);

    this.minecraftWs.connect();
    this.abioticWs.connect();
  }

  checkServerStatus(game: Games): void {
    const ws = this.getWebSocketManager(game);
    const state = game === 'minecraft' ? minecraftState : abioticState;

    state.update(s => ({
      ...s,
      statusText: "Checking server status...",
      isLoading: true
    }));

    ws.send("status");
  }

  toggleServer(game: Games): void {
    const ws = this.getWebSocketManager(game);
    const state = game === 'minecraft' ? minecraftState : abioticState;
    const currentState = get(state);

    if (!ws.isConnected) {
      state.update(s => ({
        ...s,
        statusText: "WS connection failed, refresh and try again"
      }));
      return;
    }

    if (!currentState.online) {
      state.update(s => ({
        ...s,
        buttonDisabled: true,
        statusText: "Starting server...",
        isLoading: true
      }));
      ws.send("start");
    } else {
      state.update(s => ({
        ...s,
        buttonDisabled: true,
        statusText: "Stopping server...",
        isLoading: true
      }));
      ws.send("stop");
    }
  }

  disconnect(): void {
    if (this.minecraftWs) this.minecraftWs.close();
    if (this.abioticWs) this.abioticWs.close();
  }

  private getWebSocketManager(game: Games): WebSocketManager {
    const ws = game === 'minecraft' ? this.minecraftWs : this.abioticWs;
    if (!ws) {
      throw new Error(`WebSocket manager not initialized for ${game}`);
    }
    return ws;
  }
}
