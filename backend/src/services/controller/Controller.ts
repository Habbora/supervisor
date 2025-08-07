import type CreateDeviceDto from "./types/CreateDevice.dto";
import type {
  WorkerMessageRequestTemplate,
  WorkerMessageResponseTemplate,
} from "../worker/types";
import { readDevicesConfig } from "./utils.ts/readDeviceConfig";
import { loadWorker } from "../../utils/WorkerPathLoader";
import { EventBus } from "../EventBus";

export interface ControllerEndpoint {
  name: string;
  address: number;
  value: number;
  type: "input" | "output";
}

export class Controller {
  public id: string;
  public name: string;
  public driverName: string;
  public interface: string | undefined;
  public startConfig: any;

  public worker: {
    isRunning: boolean;
  } = {
      isRunning: false,
    }

  public network: {
    type: string;
    host: string;
    port: number;
    isConnected?: boolean;
  } = {
      type: "",
      host: "",
      port: 0,
      isConnected: false,
    };

  private __worker?: Worker;

  private __endpoints: ControllerEndpoint[] = [];

  constructor(dto: CreateDeviceDto) {
    this.id = dto.id ?? crypto.randomUUID();
    this.name = dto.name;
    this.driverName = dto.driverName;
    this.startConfig = dto.startConfig;

    const deviceConfig = readDevicesConfig().find(
      (config) => config.name.toLowerCase() === dto.driverName.toLowerCase()
    );

    if (deviceConfig) {
      this.interface = deviceConfig.interface;
      this.__endpoints = deviceConfig.endpoints_register.map((endpoint) => ({
        name: endpoint.name,
        address: endpoint.address,
        value: 0,
        type: endpoint.endpointType === "input" ? "input" : "output",
      }));
    }

    this.init();
  }

  public async init() {
    if (!this.interface) throw new Error("Interface not found");

    this.__worker = loadWorker(this.interface);

    if (!this.__worker) throw new Error("Worker not found");

    this.initWorker();

    this.__worker.addEventListener(
      "message",
      this.handleWorkerMessage.bind(this)
    );

    this.__worker.addEventListener("close", () => {
      console.log("Worker closed");
      this.worker.isRunning = false;
    });

    this.worker.isRunning = true;
  }

  public stop() {
    console.log("Stopping worker");
    this.__worker?.terminate();
  }

  private handleWorkerMessage(
    event: MessageEvent<WorkerMessageResponseTemplate>
  ) {
    switch (event.data.type) {
      case "update":
        const payload = event.data.payload;
        payload.forEach(({ address, value }) => {
          const endpoint = this.__endpoints.find((e) => e.address === address);
          if (endpoint) {
            endpoint.value = value;
            EventBus.getInstance().publish('endpoint_event', {
              controller: this.name,
              endpoint: endpoint.name,
              value: endpoint.value
            });
          }
        });
        break;
      case "connected":
        this.network.isConnected = true;
        console.log("Connected");
        break;
      case "disconnected":
        this.network.isConnected = false;
        break;
    }
  }

  private initWorker() {
    if (!this.__worker) throw new Error("Worker not found");
    if (!this.interface) throw new Error("Interface not found");

    const data: WorkerMessageRequestTemplate<any> = {
      type: "init",
      payload: {
        driver: this.interface,
        network: {
          host: this.startConfig.host,
          port: this.startConfig.port,
        },
        endpoints: {
          inputs: this.__endpoints.filter((e) => e.type === "input").map((e) => ({
            name: e.name,
            type: "discrete",
            address: e.address,
          })),
          outputs: this.__endpoints.filter((e) => e.type === "output").map((e) => ({
            name: e.name,
            type: "discrete",
            address: e.address,
          })),
        },
      },
    };

    this.__worker.postMessage(data);
  }

  // Adicionar Validação de Retorno um dia!
  public setOutput(outputName: string, value: number) {
    if (!this.__worker) throw new Error("Worker not found");

    const endpoint = this.__endpoints.find((e) => e.name === outputName);
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

    this.__worker.postMessage(data);

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
    if (!this.__worker) throw new Error("Worker not found");

    const endpoint = this.__endpoints.find((e) => e.name === outputName);
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

    this.__worker.postMessage(data);

    await new Promise(resolve => setTimeout(resolve, 100));

    return this;
  }

  public addEndpoint(endpoint: ControllerEndpoint | ControllerEndpoint[]) {
    if (Array.isArray(endpoint)) endpoint.forEach((e) => this.addEndpoint(e));
    else {
      this.__endpoints.push(endpoint);
      return this;
    }
  }

  public removeEndpoint(endpoint: ControllerEndpoint) {
    this.__endpoints = this.__endpoints.filter((e) => e !== endpoint);
    return this;
  }
}
