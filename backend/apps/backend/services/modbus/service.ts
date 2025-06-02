import Modbus from "jsmodbus";
import net from "net";
import { ModbusMessageType } from "./types";
import type { ModbusMessageResponse } from "./types";
import { BaseService } from "../abstracts/BaseService";

/**
 * Serviço que gerencia a comunicação com o servidor Modbus
 * Responsável por todas as operações de leitura e escrita
 */
export class ModbusService extends BaseService {
  private socket: net.Socket;
  private modbusClient: Modbus.ModbusTCPClient;

  private postMessage: (message: ModbusMessageResponse) => void;

  private isConnected: boolean = false;

  constructor(
    private hostname: string,
    private port: number,
    postMessage: (message: ModbusMessageResponse) => void
  ) {
    super("modbus");
    this.socket = new net.Socket();
    this.modbusClient = new Modbus.ModbusTCPClient(this.socket);
    this.postMessage = postMessage;
  }

  /**
   * Configura os listeners de eventos do socket
   * Monitora conexão, erros e desconexão
   */
  private setupSocketListeners(): void {
    this.socket.on("connect", () => {
      this.isConnected = true;
      this.postMessage({
        type: ModbusMessageType.SOCKET,
        payload: [{ status: "connected" }],
        timestamp: Date.now(),
      });
    });

    this.socket.on("error", (error) => {
      this.isConnected = false;
      this.postMessage({
        type: ModbusMessageType.SOCKET,
        payload: [{ status: "disconnected" }],
        timestamp: Date.now(),
      });
      this.socket.destroy();
    });

    this.socket.on("close", () => {
      this.isConnected = false;
      this.postMessage({
        type: ModbusMessageType.SOCKET,
        payload: [{ status: "disconnected" }],
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Conecta ao servidor Modbus
   * @param host Endereço IP do servidor
   * @param port Porta do servidor
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.hostname, () => {
        resolve();
      });
    });
  }

  /**
   * Lê o estado das coils (saídas digitais)
   * @param startAddress Endereço inicial
   * @param length Quantidade de coils a ler
   */
  async readCoils(
    startAddress: number,
    length: number
  ): Promise<boolean[] | undefined> {
    try {
      const res = await this.modbusClient.readCoils(startAddress, length);
      return res.response.body.valuesAsArray.map((value: number | boolean) =>
        Boolean(value)
      );
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Escreve em múltiplas coils
   * @param startAddress Endereço inicial
   * @param state Array de estados booleanos
   */
  async writeCoil(
    startAddress: number,
    state: boolean[]
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient.writeMultipleCoils(
        startAddress,
        state
      );
      return res.response.body.quantity;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Escreve em uma única coil
   * @param address Endereço da coil
   * @param state Estado (0 ou 1)
   */
  async writeSingleCoil(
    address: number,
    state: 0 | 1
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient.writeSingleCoil(address, state);
      return res.response.body._value;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Lê registros de retenção (holding registers)
   * @param startAddress Endereço inicial
   * @param length Quantidade de registros a ler
   */
  async readRegisters(
    startAddress: number,
    length: number
  ): Promise<number[] | undefined> {
    try {
      const res = await this.modbusClient.readHoldingRegisters(
        startAddress,
        length
      );
      return Array.from(res.response.body.valuesAsArray).map((value: number) =>
        Number(value)
      );
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Escreve em múltiplos registros
   * @param startAddress Endereço inicial
   * @param value Array de valores numéricos
   */
  async writeRegister(
    startAddress: number,
    value: number[]
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient.writeMultipleRegisters(
        startAddress,
        value
      );
      return res.response.body.quantity;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Escreve em um único registro
   * @param address Endereço do registro
   * @param value Valor numérico
   */
  async writeSingleRegister(
    address: number,
    value: number
  ): Promise<number | undefined> {
    try {
      const res = await this.modbusClient.writeSingleRegister(address, value);
      return res.response.body.value;
    } catch (error) {
      this.handleError(error);
      return undefined;
    }
  }

  /**
   * Trata erros e notifica através do callback
   * @param error Erro ocorrido
   */
  private handleError(error: unknown): void {
    const errorMessage =
      error instanceof Error ? error : new Error("Unknown error");
    this.postMessage({
      type: ModbusMessageType.ERROR,
      payload: [{ error: errorMessage }],
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    });
  }

  /**
   * Retorna o status da conexão
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Desconecta do servidor Modbus
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.isConnected = false;
    }
  }
}
