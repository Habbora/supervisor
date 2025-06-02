// Classe base focada apenas em gerenciar conexões WebSocket
export class WebSocketServer {
  private server: Server | null = null;
  private connections: Set<ServerWebSocket> = new Set();
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  initialize() {
    this.server = Bun.serve({
      port: 3001,
      websocket: {
        open: (ws) => this.connections.add(ws),
        close: (ws) => this.connections.delete(ws),
        message: (ws, message) => {
          const data = JSON.parse(message.toString());
          this.eventEmitter.emit(data.type, data);
        }
      }
    });
  }

  on(event: string, handler: (data: any) => Promise<void>) {
    this.eventEmitter.on(event, handler);
  }

  broadcast(data: any) {
    const message = JSON.stringify(data);
    for (const ws of this.connections) {
      ws.send(message);
    }
  }
} 