import type { ServerWebSocket } from "bun";

export interface WebSocketClient {
  id: string;
  ws: ServerWebSocket<WebSocketClient>;
  connectedAt: Date;
} 