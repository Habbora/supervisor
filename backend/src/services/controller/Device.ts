import EventEmitter from "events";
import type { DeviceEndpoint } from "../../packages/class/device/DeviceEndpoint";
import type CreateDeviceDto from "./types/CreateDevice.dto";
import type {
  WorkerMessageRequestTemplate,
  WorkerMessageResponseTemplate,
} from "../worker/types";
import { readDevicesConfig } from "./utils.ts/readDeviceConfig";
import { loadWorker } from "../../utils/WorkerPathLoader";

export class Device extends EventEmitter {
  public id: string;
  public name: string;
  public driverName: string;
  public interface: string | undefined;
  public startConfig: any;

  public worker?: Worker;

  isReady: boolean = false;

  endpoints: DeviceEndpoint[] = [];

  constructor(dto: CreateDeviceDto) {
    super();
    this.setMaxListeners(50);
    this.id = dto.id ?? crypto.randomUUID();
    this.name = dto.name;
    this.driverName = dto.driverName;
    this.startConfig = dto.startConfig;

    const deviceConfig = readDevicesConfig().find(
      (config) => config.name.toLowerCase() === dto.driverName.toLowerCase()
    );

    if (deviceConfig) {
      this.interface = deviceConfig.interface;
      this.endpoints = deviceConfig.endpoints_register.map((endpoint) => ({
        name: endpoint.name,
        address: endpoint.address,
        value: 0,
        type: endpoint.endpointType === "input" ? "input" : "output",
      }));
    }

    this.init();
  }

  public async init() {
    // Verifica se a interface está definida
    if (!this.interface) throw new Error("Interface not found");

    // Cria o worker usando o módulo
    this.worker = loadWorker(this.interface);

    if (!this.worker) throw new Error("Worker not found");

    this.initWorker();

    this.worker.addEventListener(
      "message",
      this.handleWorkerMessage.bind(this)
    );

    this.isReady = true;
  }

  async stop() {
    this.worker?.terminate();
    this.worker = undefined;
    this.removeAllListeners();
  }

  private handleWorkerMessage(
    event: MessageEvent<WorkerMessageResponseTemplate>
  ) {
    if (event.data.type === "update") {
      const payload = event.data.payload;
      payload.forEach(({ address, value }) => {
        const endpoint = this.endpoints.find((e) => e.address === address);
        if (endpoint) {
          endpoint.value = value > 0 ? 0 : 1;
          this.emit("onChange", endpoint);
        }
      });
    }
  }

  private initWorker() {
    if (!this.worker) throw new Error("Worker not found");
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
  }

  // Adicionar Validação de Retorno um dia!
  public setOutput(outputName: string, value: number) {
    if (!this.worker) throw new Error("Worker not found");

    const endpoint = this.endpoints.find((e) => e.name === outputName);
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

  public addEndpoint(endpoint: DeviceEndpoint | DeviceEndpoint[]) {
    if (Array.isArray(endpoint)) endpoint.forEach((e) => this.addEndpoint(e));
    else {
      this.endpoints.push(endpoint);
      return this;
    }
  }

  public removeEndpoint(endpoint: DeviceEndpoint) {
    this.endpoints = this.endpoints.filter((e) => e !== endpoint);
    return this;
  }
}
