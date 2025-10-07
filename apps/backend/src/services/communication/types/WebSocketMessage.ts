export interface WebSocketMessage {
  type: string;
  code: number;
  payload: unknown;
  timestamp?: number;
} 