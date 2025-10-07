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
      this.emit("connected", {
        socket: this.socket,
      });
    });

    this.socket.on("error", (error) => {
      this.emit("error", error);
    });

    this.socket.on("close", () => {
      this.emit("close");
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;

    this.isInitializing = true;

    return new Promise((resolve, reject) => {
      this.socket?.connect(this.port, this.hostname, () => {
        this._isInitialized = true;
        this.isInitializing = false;
        resolve();
      });

      this.socket?.on("error", (error) => {
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