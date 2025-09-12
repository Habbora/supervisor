import net from "net";
import { BaseService } from "../abstracts/BaseService";

export type NetworkServiceConfig = {
  hostname: string;
  port: number;
  reconnect?: boolean;
};

export class NetworkService extends BaseService {
  private socket?: net.Socket;
  private hostname: string;
  private port: number;
  private isInitializing: boolean = false;

  constructor(config: NetworkServiceConfig) {
    super("modbus");
    this.hostname = config.hostname;
    this.port = config.port;
    this.createSocket();
  }

  private createSocket(): void {
    this.socket = new net.Socket();
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      //console.log("NetworkService: connected to", this.hostname, this.port);
      this.emit("connected", {
        socket: this.socket,
      });
    });

    this.socket.on("error", (error) => {
      //console.log("NetworkService: error to", this.hostname, this.port, error);
      this.emit("error", error);
    });

    this.socket.on("close", () => {
      //console.log("NetworkService: close to", this.hostname, this.port);
      this.emit("close");
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;

    console.log(`🔌 Tentando conectar ao ${this.hostname}:${this.port}`);

    return new Promise((resolve, reject) => {
      this.socket?.connect(this.port, this.hostname, () => {
        console.log(`🔌 Conectado com sucesso ao ${this.hostname}:${this.port}`);
        this._isInitialized = true;
        this.isInitializing = false;
        resolve();
      });

      this.socket?.on("error", (error) => {
        console.error(`🔌 Erro ao conectar ao ${this.hostname}:${this.port}:`, error);
        this.isInitializing = false;
        reject(error);
      });
    });
  }

  async destroy(): Promise<void> {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.destroy();
      this.socket = undefined;
    }
    this._isInitialized = false;
    this.isInitializing = false;
  }

  getSocket(): net.Socket | undefined {
    return this.socket;
  }

  getIsConnected(): boolean {
    return this.socket?.readyState === "open";
  }
} 