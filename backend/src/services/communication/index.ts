import type { Server } from "bun";
import {
  WEBSOCKET_CONFIG,
} from "./constants/websocket.constants";
import { readdirSync, statSync, watch } from "fs";
import { join } from "path";
import { EventEmitter } from "events";
import { EventBus } from "../event-bus";

export class WebService extends EventEmitter {
  // Servidor WebSocket
  private server: Server | undefined;
  // Mapa de handlers de mensagens
  private routes: Map<string, any> = new Map();
  private routesWatcher: any;

  public async initialize(): Promise<this> {
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
      idleTimeout: 255,
    });

    return this;
  }

  private async loadRoutes(directory: string, basePath: string = "") {
    const files = readdirSync(directory);

    for (const file of files) {
      const fullPath = join(directory, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Verifica se é um parâmetro dinâmico (ex: [id], [userId])
        if (file.startsWith('[') && file.endsWith(']')) {
          // Converte [id] em regex pattern para capturar qualquer valor
          const paramName = file.slice(1, -1); // Remove os colchetes
          const dynamicPath = `${basePath}/:${paramName}`;
          await this.loadRoutes(fullPath, dynamicPath);
        } else {
          await this.loadRoutes(fullPath, `${basePath}/${file}`);
        }
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

    //console.log('req', req);

    //console.log(`🔍 Procurando rota: ${method} ${path}`);

    // Primeiro tenta encontrar uma rota exata
    let routeModule = this.routes.get(path);
    let params: Record<string, string> = {};

    if (routeModule) {
      //console.log(`✅ Rota exata encontrada: ${path}`);
    } else {
      //console.log(`🔍 Procurando rota dinâmica para: ${path}`);

      // Se não encontrar rota exata, procura por rotas dinâmicas
      for (const [routePath, module] of this.routes.entries()) {
        if (routePath.includes(':')) {
          //console.log(`🔍 Testando rota dinâmica: ${routePath}`);

          // Converte rota dinâmica em regex
          const regexPattern = routePath.replace(/:[^/]+/g, '([^/]+)');
          const regex = new RegExp(`^${regexPattern}$`);

          if (regex.test(path)) {
            //console.log(`✅ Rota dinâmica encontrada: ${routePath} → ${path}`);

            // Extrai os parâmetros
            const matches = path.match(regex);
            if (matches) {
              const paramNames = routePath.match(/:[^/]+/g) || [];
              params = {};

              paramNames.forEach((paramName, index) => {
                const key = paramName.slice(1); // Remove o ':'
                params[key] = matches[index + 1]; // +1 porque matches[0] é a string completa
              });

              //console.log(`📝 Parâmetros extraídos:`, params);

              routeModule = module;
              break;
            }
          }
        }
      }
    }

    if (!routeModule) {
      //console.log(`❌ Rota não encontrada: ${path}`);
      //console.log(`📋 Rotas disponíveis:`, Array.from(this.routes.keys()));
      return new Response("Rota não encontrada", { status: 404 });
    }

    const handler = routeModule[method];
    if (!handler) {
      //console.log(`❌ Método ${method} não permitido para rota: ${path}`);
      return new Response("Método não permitido", { status: 405 });
    }

    //console.log(`✅ Executando handler: ${method} ${path}`);

    // Cria um objeto com os parâmetros extraídos para passar para o handler
    const enhancedReq = Object.assign(req, { params });

    return handler(enhancedReq);
  }

  public async destroy(): Promise<void> {
    if (this.routesWatcher) {
      this.routesWatcher.close();
    }
    if (this.server) {
      this.server.stop();
    }
  }
}
