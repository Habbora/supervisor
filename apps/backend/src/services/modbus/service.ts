import Modbus from "jsmodbus";
import { ModbusMessageType } from "./types";
import type { ModbusMessageResponse } from "./types";
import { BaseService } from "../abstracts/BaseService";
import { NetworkService } from "./network";

type NetworkConfig = {
  hostname: string;
  port: number;
};

export class ModbusService extends BaseService {
  private networkService?: NetworkService;
  private modbusClient?: Modbus.ModbusTCPClient;
  private postMessage: (message: ModbusMessageResponse) => void;
  private isConnected: boolean = false;
  private isError: boolean = false;
  private reconnectTimeout: NodeJS.Timer | undefined;

  constructor(
    private networkConfig: NetworkConfig,
    postMessage: (message: ModbusMessageResponse) => void
  ) {
    super("modbus");
    this.postMessage = postMessage;
    this.initializeService();
  }

  async initialize(): Promise<void> {
    await this.initializeService();
  }

  private async initializeService(): Promise<void> {

    try {
      // 1. Criar o NetworkService
      this.networkService = new NetworkService(this.networkConfig);

      // 2. Configurar os listeners
      this.setupEventListeners();

      // 3. Criar o ModbusClient com o socket
      const socket = this.networkService?.getSocket();
      if (!socket) throw new Error("Socket não disponível");
      this.modbusClient = new Modbus.ModbusTCPClient(socket);

      // 4. Inicializar o NetworkService
      await this.networkService.initialize();

      // Verificar se a conexão foi estabelecida
      if (this.modbusClient?.connectionState === "online") {
        this.isConnected = true;
        this.emit("online");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private setupEventListeners(): void {
    this.networkService?.on("connected", () => {
      this.isConnected = true;
      this.isError = false;
      this.emit("online");
      this.postMessage({
        type: ModbusMessageType.CONNECTED,
        payload: [],
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
      });
    });

    this.networkService?.on("close", () => {
      this.isConnected = false;
      this.emit("offline");
      this.postMessage({
        type: ModbusMessageType.DISCONNECTED,
        payload: [],
        timestamp: Date.now(),
        requestId: crypto.randomUUID(),
      });
      this.scheduleReconnect();
    });

    this.networkService?.on("error", (error) => {
      this.isError = true;
      this.handleError(error);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.initializeService();
      } catch (error) {
        this.scheduleReconnect();
      }
    }, 2000);
  }

  private handleError(error: unknown): void {
    const errorMessage = error instanceof Error ? error : new Error("Unknown error");
    this.postMessage({
      type: ModbusMessageType.ERROR,
      payload: [{ error: errorMessage }],
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    });
  }

  getConnectionStatus(): boolean {
    return this.modbusClient?.connectionState === "online";
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.networkService) {
      this.networkService.destroy();
      this.isConnected = false;
    }
  }

  // Funções de leitura e escrita
  async readCoils(
    startAddress: number,
    length: number
  ): Promise<boolean[] | undefined> {
    try {
      const res = await this.modbusClient?.readCoils(startAddress, length);
      return res?.response.body.valuesAsArray.map((value: number | boolean) =>
        Boolean(value)
      );
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async writeCoil(
    startAddress: number,
    state: boolean[]
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient?.writeMultipleCoils(
        startAddress,
        state
      );
      return res?.response.body.quantity;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async writeSingleCoil(
    address: number,
    state: 0 | 1
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient?.writeSingleCoil(address, state);
      return res?.response.body._value;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async readRegisters(
    startAddress: number,
    length: number
  ): Promise<number[] | undefined> {
    try {
      const res = await this.modbusClient!.readHoldingRegisters(
        startAddress,
        length
      );
      return Array.from(res?.response.body.valuesAsArray || []).map((value: number) =>
        Number(value)
      );
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async writeRegister(
    startAddress: number,
    value: number[]
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient?.writeMultipleRegisters(
        startAddress,
        value
      );
      return res?.response.body.quantity;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  async writeSingleRegister(
    address: number,
    value: number
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient?.writeSingleRegister(address, value);
      return res?.response.body.value;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }
}
