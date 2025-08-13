import type { Games } from '../types.js';
import type { MessageHandler } from './message-handler';

export class WebSocketManager {
  private ws: WebSocket | null = null;

  constructor(
    private game: Games,
    private url: string,
    private messageHandler: MessageHandler
  ) { }

  connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.send('status');
    };

    this.ws.onclose = () => {
      this.messageHandler.handleConnectionError(this.game);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const eventData = JSON.parse(event.data);
      this.messageHandler.handleMessage(this.game, eventData);
    };
  }

  send(message: string): void {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(message);
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === this.ws.OPEN;
  }
}
