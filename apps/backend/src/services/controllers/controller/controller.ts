import type {
  WorkerMessageRequestTemplate,
  WorkerMessageResponseTemplate,
} from "@services/worker/types";

import { EventBus } from "@services/event-bus/index.ts";
import { readControllerConfigs } from "@services/controllers/utils/readDeviceConfig";
import { loadWorker } from "@/utils/WorkerPathLoader";
import type { ControllerSchema } from "@services/database/controllers/schema";
import type { ControllerEndpoint } from "./endpoint.schema";

/*
  # Classe Controller (Controlador)

  # Atributos
  ## Atributos Básicos
  - id: string;
  - name: string;
  - interface: string | undefined;
  - configs: {
      tcp?: {
        host: string;
        port: number;
      };
      udp?: {
        host: string;
        port: number;
      };
    };
  - status: ControllerStatusType;

  ## Atributos do Worker
  - interface: string | undefined;
  - startConfig: any;

  ## Atributos do Controller
  - configs: ControllerConfigType;

  # Métodos
  - init(): void; # Inicializa o controlador
  - stop(): void; # Para o controlador
  - setOutput(outputName: string, value: number): void; # Define o valor de um output
  - setPulse(outputName: string, timeout: number = 250): void; # Define o valor de um output com pulso
  - forceEndpoint(outputName: string, value: number): void; # Força o valor de um output
*/

type ControllerStatusType = {
  isEnabled: boolean;
  isRunning: boolean;
  isConnected: boolean;
};

export class Controller {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly configs?: any;

  private readonly worker?: Worker;
  private readonly endpoints?: ControllerEndpoint[] = [];

  public status: ControllerStatusType = {
    isEnabled: false,
    isRunning: false,
    isConnected: false,
  };

  constructor(dto: ControllerSchema) {
    this.id = dto.id;
    this.name = dto.name;
    this.type = dto.type;
    this.configs = dto.configs;

    const deviceConfig = readControllerConfigs()
      .find((config) => config.name.toLowerCase() === dto.type.toLowerCase());
    if (!deviceConfig) throw new Error("Device config not found");

    this.endpoints = deviceConfig.endpoints_register?.map((endpoint) => ({
      name: endpoint.name,
      address: endpoint.address,
      type: endpoint.endpointType as "input" | "output",
    }));

    this.worker = loadWorker(deviceConfig.protocol);
    if (!this.worker) throw new Error("Worker not found");

    this.initWorker();

    this.worker.addEventListener("message",
      this.handleWorkerMessage.bind(this)
    );

    this.worker.addEventListener("close", () => {
      this.status.isRunning = false;
    });

    this.worker.addEventListener("error", (error) => {
      this.status.isRunning = false;
    });

    EventBus.getInstance().subscribe('controller_action', this.handlerActionEvent.bind(this));

    EventBus.getInstance().subscribe('force_read_endpoint',
      this.handlerForceReadEndpoint.bind(this));
  }

  private handlerForceReadEndpoint(data: { controllerId: string, endpointName: string }) {
    if (!data.controllerId || !data.endpointName) return;
    if (data.controllerId !== this.id) return;

    const endpoint = this.endpoints?.find((e) => e.name === data.endpointName);
    if (!endpoint) return;

    const payload = {
      controllerId: this.id,
      endpointName: endpoint.name,
      value: endpoint.value ?? -1
    } as any;

    EventBus.getInstance().publish('endpoint_event', payload);
  }

  public stop() {
    this.worker?.terminate();
  }

  private handleWorkerMessage(
    event: MessageEvent<WorkerMessageResponseTemplate>
  ) {
    switch (event.data.type) {
      case "update": {
        const payload = event.data.payload;
        payload.forEach(({ address, value }) => {
          const endpoint = this.endpoints?.find((e) => e.address === address);
          if (endpoint) {
            endpoint.value = value;

            const payload = {
              controllerId: this.id,
              endpointName: endpoint.name,
              value: endpoint.value
            } as any;

            // Evento enviado para os dispositivos.
            EventBus.getInstance().publish('endpoint_event', payload);
          }
        });
        break;
      }
      case "connected": {
        this.status.isConnected = true;
        console.log("Connected");
        break;
      }
      case "disconnected": {
        this.status.isConnected = false;
        break;
      }
    }
  }

  private async handlerActionEvent(data: { id: string, endpointName: string, type: string }) {
    if (!data.id || !data.endpointName || !data.type || !this.worker) return;
    switch (data.type) {
      case "setOn": {
        await this.setOutput(data.endpointName, 1);
        break;
      }
      case "setOff": {
        await this.setOutput(data.endpointName, 0);
        break;
      }
    }
  }

  private initWorker() {
    if (!this.worker) throw new Error("Worker not found");
    if (!this.type) throw new Error("Interface not found");

    if (!this.configs?.network?.host || !this.configs?.network?.port) {
      return;
    }

    if (!this.endpoints) throw new Error("Endpoints not found");

    const data: WorkerMessageRequestTemplate<any> = {
      type: "init",
      payload: {
        driver: this.type,
        network: {
          host: this.configs.network.host,
          port: this.configs.network.port,
        },
        endpoints: {
          inputs: this.endpoints.filter((e) => e.type === "input").map((e) => ({
            name: e.name,
            type: "discrete",
            address: e.address,
          })),
          outputs: this.endpoints.filter((e) => e.type === "output").map((e) => ({
            name: e.name,
            type: "discrete",
            address: e.address,
          })),
        },
      },
    };

    this.worker.postMessage(data);

    this.status.isRunning = true;
  }

  public setOutput(outputName: string, value: number) {
    console.log('outputName', outputName);
    if (!this.worker) throw new Error("Worker not found");

    console.log('outputName', outputName);

    const endpoint = this.endpoints?.find((e) => e.name === outputName);
    if (!endpoint) throw new Error("Endpoint not found");

    const data: WorkerMessageRequestTemplate<any> = {
      type: "command",
      payload: {
        id: crypto.randomUUID(),
        type: "write",
        payload: {
          type: "discrete",
          address: endpoint.address,
          value,
        },
      },
    };

    this.worker.postMessage(data);

    return this;
  }

  public setPulse(outputName: string, timeout: number = 250) {
    this.setOutput(outputName, 1);
    setTimeout(() => {
      this.setOutput(outputName, 0);
    }, timeout);

    return this;
  }

  public async forceEndpoint(outputName: string, value: number) {
    if (!this.worker) throw new Error("Worker not found");

    const endpoint = this.endpoints?.find((e) => e.name === outputName);
    if (!endpoint) throw new Error("Endpoint not found");

    const data: WorkerMessageRequestTemplate<any> = {
      type: "command",
      payload: {
        id: crypto.randomUUID(),
        type: "force",
        payload: {
          type: "discrete",
          address: endpoint.address,
          value: value,
        },
      },
    };

    this.worker.postMessage(data);

    await new Promise(resolve => setTimeout(resolve, 100));

    return this;
  }

  public toDashboard() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
    };
  }
}
