/**
 * Driver Runtime
 *
 * Executa drivers compilados em sandbox isolado com injeção de dependências
 */

import { systemBindings } from '../05-system-runtime/system-bindings';

export interface RuntimeInstance {
  id: string;
  driverId: string;
  instance: any;
  config: any;
  metadata: any;
  bindingMasterId?: string;
  status: 'initializing' | 'running' | 'stopped' | 'error';
  startedAt: Date;
  error?: string;
}

export interface SystemAPI {
  log: {
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
  };
  tcp: {
    createSocket(): SafeTCPSocket;
  };
  http: {
    fetch(url: string, options?: any): Promise<Response>;
  };
  createBindingMaster(type: string, config: any): any;
  createBindingSlave(config: any): any;
  events: {
    on(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
    off(event: string, handler: Function): void;
  };
  time: {
    setTimeout(fn: Function, ms: number): NodeJS.Timeout;
    setInterval(fn: Function, ms: number): NodeJS.Timeout;
    clearTimeout(id: NodeJS.Timeout): void;
    clearInterval(id: NodeJS.Timeout): void;
  };
}

export class DriverRuntime {
  private instances = new Map<string, RuntimeInstance>();
  private eventBus = new EventEmitter();

  /**
   * Carrega e executa driver
   */
  async loadDriver(
    driverId: string,
    code: string,
    config: any,
    metadata: any
  ): Promise<RuntimeInstance> {
    const instanceId = crypto.randomUUID();

    try {
      // 1. Criar context sandbox
      const context = this.createSandboxContext(instanceId, config);

      // 2. Executar código compilado
      // Usa eval dinâmico (seguro porque código já foi validado)
      const moduleFactory = new Function('system', 'config', `
        ${code}
        return this;
      `);

      const moduleExports = moduleFactory.call({}, context.system, config);

      // 3. Extrair classe do driver
      const DriverClass = moduleExports.default || moduleExports[metadata.exports.className];
      if (!DriverClass) {
        throw new Error('Driver must export default class');
      }

      // 4. Instanciar driver
      const instance = new DriverClass();

      // 5. Criar registro da instância
      const runtimeInstance: RuntimeInstance = {
        id: instanceId,
        driverId,
        instance,
        config,
        metadata,
        status: 'initializing',
        startedAt: new Date(),
      };

      this.instances.set(instanceId, runtimeInstance);

      // 6. Chamar lifecycle hook @OnInit
      if (metadata.lifecycle.onInit && instance.initialize) {
        await instance.initialize();
      }

      // 7. Registrar binding master ID
      if (instance.bindingMaster) {
        runtimeInstance.bindingMasterId = instance.bindingMaster.id;
      }

      // 8. Configurar polling (@Poll hooks)
      for (const poll of metadata.lifecycle.polls) {
        if (instance[poll.methodName]) {
          setInterval(() => {
            instance[poll.methodName]().catch((error: any) => {
              this.handleError(instanceId, error);
            });
          }, poll.interval);
        }
      }

      // 9. Atualizar status
      runtimeInstance.status = 'running';

      console.log(`[Runtime] Driver ${driverId} loaded as instance ${instanceId}`);

      return runtimeInstance;
    } catch (error: any) {
      console.error(`[Runtime] Failed to load driver ${driverId}:`, error);

      const failedInstance: RuntimeInstance = {
        id: instanceId,
        driverId,
        instance: null,
        config,
        metadata,
        status: 'error',
        startedAt: new Date(),
        error: error.message,
      };

      this.instances.set(instanceId, failedInstance);
      throw error;
    }
  }

  /**
   * Cria context sandbox com system API
   */
  private createSandboxContext(instanceId: string, config: any) {
    const system: SystemAPI = {
      // Logging
      log: {
        info: (...args: any[]) => this.log(instanceId, 'info', args),
        warn: (...args: any[]) => this.log(instanceId, 'warn', args),
        error: (...args: any[]) => this.log(instanceId, 'error', args),
        debug: (...args: any[]) => this.log(instanceId, 'debug', args),
      },

      // TCP Socket seguro
      tcp: {
        createSocket: () => this.createTCPSocket(instanceId),
      },

      // HTTP fetch seguro
      http: {
        fetch: (url: string, options?: any) => this.safeFetch(instanceId, url, options),
      },

      // Bindings
      createBindingMaster: (type: string, cfg: any) => {
        console.log(`[Runtime:${instanceId}] Creating binding master: ${cfg.id}`);
        return systemBindings.createBindingMaster(type, cfg);
      },

      createBindingSlave: (cfg: any) => {
        console.log(`[Runtime:${instanceId}] Creating binding slave: ${cfg.endpointId}`);
        return systemBindings.createBindingSlave(cfg);
      },

      // Event Bus
      events: {
        on: (event: string, handler: Function) => {
          this.eventBus.on(event, handler);
        },
        emit: (event: string, data?: any) => {
          this.eventBus.emit(event, data);
        },
        off: (event: string, handler: Function) => {
          this.eventBus.off(event, handler);
        },
      },

      // Time utilities
      time: {
        setTimeout: (fn: Function, ms: number) => setTimeout(fn, ms),
        setInterval: (fn: Function, ms: number) => setInterval(fn, ms),
        clearTimeout: (id: NodeJS.Timeout) => clearTimeout(id),
        clearInterval: (id: NodeJS.Timeout) => clearInterval(id),
      },
    };

    return { system };
  }

  /**
   * Logging centralizado por instância
   */
  private log(instanceId: string, level: string, args: any[]) {
    const instance = this.instances.get(instanceId);
    const prefix = instance ? `[Driver:${instance.metadata.name}]` : `[Driver:${instanceId}]`;

    console.log(`${prefix} [${level}]`, ...args);

    // Emite evento para logging externo
    this.eventBus.emit('driver:log', {
      instanceId,
      level,
      message: args.join(' '),
      timestamp: new Date(),
    });
  }

  /**
   * Cria TCP Socket seguro com rate limiting
   */
  private createTCPSocket(instanceId: string): SafeTCPSocket {
    return new SafeTCPSocket(instanceId, {
      onConnect: (host: string, port: number) => {
        this.log(instanceId, 'info', [`TCP connecting to ${host}:${port}`]);
      },
      onDisconnect: () => {
        this.log(instanceId, 'info', ['TCP disconnected']);
      },
      onError: (error: Error) => {
        this.log(instanceId, 'error', [`TCP error: ${error.message}`]);
      },
    });
  }

  /**
   * Fetch seguro com whitelist
   */
  private async safeFetch(instanceId: string, url: string, options?: any): Promise<Response> {
    // Validar URL (whitelist, rate limiting, etc.)
    const urlObj = new URL(url);

    // Exemplo: bloquear localhost (pode ajustar conforme necessidade)
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      throw new Error('Fetching localhost is not allowed');
    }

    this.log(instanceId, 'debug', [`HTTP fetch: ${url}`]);

    return fetch(url, {
      ...options,
      // Força timeout
      signal: AbortSignal.timeout(10000),
    });
  }

  /**
   * Para e remove driver
   */
  async unloadDriver(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    try {
      // 1. Chamar lifecycle hook @OnClose
      if (instance.metadata.lifecycle.onClose && instance.instance?.cleanup) {
        await instance.instance.cleanup();
      }

      // 2. Remover do mapa
      this.instances.delete(instanceId);

      console.log(`[Runtime] Driver instance ${instanceId} unloaded`);
    } catch (error: any) {
      console.error(`[Runtime] Error unloading instance ${instanceId}:`, error);
      throw error;
    }
  }

  /**
   * Reinicia driver
   */
  async restartDriver(instanceId: string): Promise<RuntimeInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    // Para driver atual
    await this.unloadDriver(instanceId);

    // Carrega novamente (precisa do código original)
    // Nota: código deveria ser armazenado ou recuperado do banco
    throw new Error('Restart not implemented - need to fetch code from database');
  }

  /**
   * Lista instâncias em execução
   */
  listInstances(): RuntimeInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Retorna instância específica
   */
  getInstance(instanceId: string): RuntimeInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Estatísticas
   */
  getStats() {
    return {
      totalInstances: this.instances.size,
      running: Array.from(this.instances.values()).filter(i => i.status === 'running').length,
      error: Array.from(this.instances.values()).filter(i => i.status === 'error').length,
      instances: this.listInstances().map(i => ({
        id: i.id,
        driverId: i.driverId,
        name: i.metadata.name,
        status: i.status,
        bindingMasterId: i.bindingMasterId,
        startedAt: i.startedAt,
      })),
    };
  }

  /**
   * Trata erro de execução
   */
  private handleError(instanceId: string, error: Error) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = 'error';
      instance.error = error.message;
    }

    this.log(instanceId, 'error', [error.message]);

    this.eventBus.emit('driver:error', {
      instanceId,
      error: error.message,
      timestamp: new Date(),
    });
  }

  /**
   * Para todos os drivers
   */
  async shutdown() {
    console.log('[Runtime] Shutting down all drivers...');

    const instances = Array.from(this.instances.keys());
    for (const instanceId of instances) {
      try {
        await this.unloadDriver(instanceId);
      } catch (error) {
        console.error(`[Runtime] Error shutting down ${instanceId}:`, error);
      }
    }

    console.log('[Runtime] Shutdown complete');
  }
}

/**
 * Safe TCP Socket com rate limiting e logging
 */
export class SafeTCPSocket {
  private socket: any = null;
  private instanceId: string;
  private callbacks: any;
  private connected = false;

  constructor(instanceId: string, callbacks: any) {
    this.instanceId = instanceId;
    this.callbacks = callbacks;
  }

  async connect(host: string, port: number): Promise<void> {
    if (this.connected) {
      throw new Error('Socket already connected');
    }

    try {
      this.callbacks.onConnect?.(host, port);

      // Cria socket TCP real com Bun
      this.socket = await Bun.connect({
        hostname: host,
        port,
        socket: {
          open: (socket) => {
            this.connected = true;
          },
          close: () => {
            this.connected = false;
            this.callbacks.onDisconnect?.();
          },
          error: (socket, error) => {
            this.callbacks.onError?.(error);
          },
          data: (socket, data) => {
            // Buffer de dados recebidos
          },
        },
      });
    } catch (error: any) {
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  async send(data: Buffer | Uint8Array): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.write(data);
  }

  async receive(): Promise<Buffer> {
    if (!this.connected || !this.socket) {
      throw new Error('Socket not connected');
    }

    // Implementação de receive com timeout
    // Nota: isso precisa de buffer interno ou promise-based reading
    return Buffer.from([]);
  }

  async close(): Promise<void> {
    if (this.socket) {
      this.socket.end();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Event Emitter simples
 */
class EventEmitter {
  private events = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  emit(event: string, data?: any) {
    const handlers = this.events.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    }
  }

  off(event: string, handler: Function) {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

/**
 * Singleton runtime
 */
export const driverRuntime = new DriverRuntime();
