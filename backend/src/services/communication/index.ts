import { BaseService } from "../abstracts/BaseService";
import type { Server, ServerWebSocket } from "bun";
import type {
  WebSocketMessage,
  WebSocketClient,
  WebSocketHandler,
} from "./types";
import {
  WEBSOCKET_CONFIG,
  WEBSOCKET_ERRORS,
  WEBSOCKET_ROUTES,
} from "./constants/websocket.constants";
import { readdirSync, statSync, watch } from "fs";
import { join } from "path";

export class WebService extends BaseService {
  // Servidor WebSocket
  private server: Server | undefined;
  // Mapa de conexões
  private connections = new Set<ServerWebSocket>();
  // Mapa de handlers de mensagens
  private messageHandlers: Map<string, WebSocketHandler[]> = new Map();
  private routes: Map<string, any> = new Map();
  private routesWatcher: any;

  constructor() {
    super("WebSocketService");
  }

  private async loadRoutes(directory: string, basePath: string = "") {
    const files = readdirSync(directory);

    for (const file of files) {
      const fullPath = join(directory, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        await this.loadRoutes(fullPath, `${basePath}/${file}`);
      } else if (file === "route.ts") {
        const routeModule = await import(fullPath);
        const routePath = basePath || "/";

        this.routes.set(routePath, routeModule);
      }
    }
  }

  private setupRoutesWatcher(directory: string) {
    if (this.routesWatcher) {
      this.routesWatcher.close();
    }

    this.routesWatcher = watch(
      directory,
      { recursive: true },
      async (eventType, filename) => {
        if (filename && filename.endsWith("route.ts")) {
          console.log(`Detectada mudança em: ${filename}`);
          this.routes.clear();
          await this.loadRoutes(directory);
          console.log("Rotas recarregadas com sucesso!");
        }
      }
    );
  }

  private async handleRoute(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const routeModule = this.routes.get(path);
    if (!routeModule) {
      return new Response("Rota não encontrada", { status: 404 });
    }

    const handler = routeModule[method];
    if (!handler) {
      return new Response("Método não permitido", { status: 405 });
    }

    return handler(req);
  }

  public registerWebsocketHandler(handler: WebSocketHandler) {
    const handlers = this.messageHandlers.get(handler.type) || [];
    handlers.push(handler);
    this.messageHandlers.set(handler.type, handlers);
  }

  public async initialize(): Promise<this> {
    if (this._isInitialized) return this;
    console.log("Iniciando WebSocketService...");

    const routesDir = join(process.cwd(), "src/routes");

    // Carrega as rotas
    await this.loadRoutes(routesDir);

    // Configura o watcher
    this.setupRoutesWatcher(routesDir);

    this.server = Bun.serve({
      hostname: WEBSOCKET_CONFIG.HOST,
      port: WEBSOCKET_CONFIG.PORT,
      fetch: async (req, server) => {
        if (req.method === "OPTIONS") {
          return new Response(null, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Max-Age": "86400",
            },
          });
        }

        if (server.upgrade(req)) return new Response();
        
        // Adiciona headers CORS para todas as respostas
        const response = await this.handleRoute(req);
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      },
      websocket: {
        open: (ws) => {
          this.connections.add(ws as ServerWebSocket);
          this.emit("open", ws);
        },
        close: (ws) => {
          this.connections.delete(ws as ServerWebSocket);
          this.emit("close", ws);
        },
        message: (ws, message) => {
          this.emit("message", ws, message);
        },
      },
    });

    this._isInitialized = true;

    console.log(
      `WebSocketService inicializado com sucesso! Servidor escutando na porta ${WEBSOCKET_CONFIG.PORT}`
    );

    return this;
  }

  public broadcast(data: WebSocketMessage) {
    const message = JSON.stringify(data);
    this.connections.forEach((client) => {
      if (client.readyState === WebSocket.CLOSED) {
        this.connections.delete(client);
      } else {
        client.send(message);
      }
    });
  }

  public async destroy(): Promise<void> {
    if (this.routesWatcher) {
      this.routesWatcher.close();
    }
    if (this.server) {
      this.server.stop();
      this.connections.clear();
    }
    await super.destroy();
  }
}
