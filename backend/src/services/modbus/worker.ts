import { ModbusService } from "./service";
import { ModbusMessageType } from "./types";

import type {
  ModbusMessageRequest,
  ModbusMessageResponse,
  ModbusPayloadResponse,
} from "./types";

/**
 * Worker que gerencia as operações do Modbus
 * Responsável por coordenar o polling e processar mensagens
 */
export class ModbusWorker {
  private modbusService: ModbusService;

  private hostname: string;
  private port: number;

  private postMessage: (message: ModbusMessageResponse) => void;

  private lastState: Map<number, number> = new Map();

  public isConnected: boolean = false;

  constructor(config: {
    host: string;
    port?: number;
    postMessage: (message: ModbusMessageResponse) => void;
  }) {
    this.hostname = config.host;
    this.port = config.port ?? 502;
    this.postMessage = config.postMessage;
    this.modbusService = new ModbusService({
      hostname: this.hostname,
      port: this.port,
    }, this.postMessage);
  }

  async initialize(): Promise<void> {
    await this.modbusService.initialize();
    this.isConnected = this.modbusService.getConnectionStatus();
    this.startPolling(1000); // Polling a cada 1 segundo
  }

  private createResponse(
    type: ModbusMessageType,
    payload: ModbusPayloadResponse[]
  ): ModbusMessageResponse {
    return {
      type,
      payload,
      timestamp: Date.now(),
      requestId: crypto.randomUUID(),
    };
  }

  // Timer para o polling
  private __runtime: NodeJS.Timer | undefined;
  async startPolling(interval: number) {
    this.__runtime = setInterval(() => {
      this.polling();
    }, interval);
  }

  stopPolling() {
    if (this.__runtime) {
      clearInterval(this.__runtime);
      this.__runtime = undefined;
    }
  }

  private async polling() {
    try {
      // Lê 17 registros a partir do endereço 0
      const startAddress = 1;
      const endAddress = 90;
      const registers: number[] = await this.modbusService.readRegisters(startAddress, endAddress) ?? [];
      console.log(registers);

      if (registers.length === 0)
        for (let i = startAddress; i <= endAddress; i++) {
          registers.push(-1);
        }

      const changes = new Map<number, number>();

      // Compara com o último estado e identifica mudanças
      registers.forEach((value: number, index: number) => {
        if (this.lastState.get(index) !== value) {
          changes.set(index + startAddress, value);
          this.lastState.set(index, value);
        }
      });

      // Notifica apenas se houver mudanças
      if (changes.size > 0) {
        const payload = Array.from(changes.entries()).map(
          ([address, value]) => ({
            address,
            value,
          })
        );

        const response = this.createResponse(ModbusMessageType.UPDATE, payload);
        this.postMessage(response);

      }
    } catch (error) {
      this.postMessage(
        this.createResponse(ModbusMessageType.ERROR, [
          {
            error: error instanceof Error ? error : new Error("Polling error"),
          },
        ])
      );
    }
  }

  async handleMessage(message: ModbusMessageRequest) {
    switch (message.type) {
      case "write":
        try {
          // Validação dos parâmetros
          if (
            !message.payload?.address ||
            message.payload?.value === undefined
          ) {
            throw new Error(
              "Address and value are required for WRITE operation"
            );
          }

          // Converte o valor para 0 ou 1
          const value =
            typeof message.payload.value === "number"
              ? message.payload.value > 0
                ? 1
                : 0
              : 0;

          // Executa a escrita
          const address = message.payload.address;
          const response = await this.modbusService.writeSingleRegister(
            address,
            value
          );

          // Notifica o resultado
          if (response !== undefined) {
            this.postMessage(
              this.createResponse(ModbusMessageType.UPDATE, [
                {
                  address: message.payload.address,
                  value: response,
                },
              ])
            );
          }
        } catch (error) {
          this.postMessage(
            this.createResponse(ModbusMessageType.ERROR, [
              {
                address: message.payload?.address ?? 0,
                status: "error",
                error:
                  error instanceof Error ? error : new Error("Unknown error"),
              },
            ])
          );
        }
        break;

      default:
        this.postMessage(
          this.createResponse(ModbusMessageType.ERROR, [
            {
              status: "error",
              error: new Error(`No handler for message type: ${message.type}`),
            },
          ])
        );
    }
  }
}
