import type { WebSocketMessage } from "./WebSocketMessage";
import type { ServerWebSocket } from "bun";

export interface WebSocketHandler {
  type: string;
  handle: (data: WebSocketMessage, client: ServerWebSocket) => Promise<void>;
} 