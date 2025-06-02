import EventEmitter from "events";
import type { DeviceEndpoint } from "../../../../packages/class/device/DeviceEndpoint";
import type CreateDeviceDto from "./types/CreateDevice.dto";
import { DriverService } from "../driver";
import type { WorkerMessageRequestTemplate, WorkerMessageResponseTemplate } from "../worker/types";

export * from "../../../../packages/class/device/DeviceManager";

const mpc46a_config = {
  driver: "modbus",
  endpoints: {
    outputs_boolean: [
      {
        id: "1",
        name: "output1",
        type: "pulse",
        address: 1,
    },
    {
      id: "2",
      name: "output2",
      type: "pulse",
      address: 2,
    },
    {
      id: "3",
      name: "output3",
      type: "pulse",
      address: 3,
    },
    {
      id: "4",
      name: "output4",
      type: "pulse",
      address: 4,
    },
    {
      id: "5",
      name: "output5",
      type: "pulse",
      address: 5,
    },
    {
      id: "6",
      name: "output6",
      type: "pulse",
      address: 6,
    },
    {
      id: "7",
      name: "output7",
      type: "pulse",
      address: 7,
    },
    {
      id: "8",
      name: "output8",
      type: "pulse",
      address: 8,
    },
    {
      id: "9",
      name: "output9",
      type: "pulse",
      address: 9,
    },
    {
      id: "10",
      name: "output10",
      type: "pulse",
      address: 10,
    },
    {
      id: "11",
      name: "output11",
      type: "pulse",
      address: 11,
    },
    {
      id: "12",
      name: "output12",
      type: "pulse",
      address: 12,
    },
    {
      id: "13",
      name: "output13",
      type: "pulse",
      address: 13,
    },
    {
      id: "14",
      name: "output14",
      type: "pulse",
      address: 14,
    },
    {
      id: "15",
      name: "output15",
      type: "pulse",
      address: 15,
    },
    {
      id: "16",
      name: "output16",
      type: "pulse",
      address: 16,
      },
    ],
  },
};

export class Device extends EventEmitter {
  public id: string;
  public name: string;
  public driverName: string;

  public worker?: Worker;
  public startConfig: any;

  isReady: boolean = false;

  endpoints: DeviceEndpoint[] = [];

  constructor(dto: CreateDeviceDto) {
    super();
    this.id = dto.id ?? crypto.randomUUID();
    this.name = dto.name;
    this.driverName = dto.driverName;
    this.startConfig = dto.startConfig;

    this.start();
    this.setMaxListeners(50);
  }

  async start() {
    try {
      const driver = await this.__findDriver();
      this.worker = new Worker(driver.path);

      this.worker.addEventListener("open", () => {
        this.initWorker();
        //this.emit("open", this);
      });

      this.worker.onmessage = (event: MessageEvent<WorkerMessageResponseTemplate>) => {
        this.emit(`device:${this.id}`, event.data);
      };

      this.worker.onerror = (event) => {
        this.emit("error", event);
      };

      this.isReady = true;
    } catch (error) {
      throw new Error("Failed to create worker");
    }
  }

  async stop() {
    this.worker?.terminate();
    this.worker = undefined;
    this.removeAllListeners();
  }

  private async __findDriver() {
    const driver = await DriverService.getDriver(this.driverName);
    if (!driver) throw new Error("Driver not found");
    return driver;
  }

  private initWorker() {
    if (!this.worker) throw new Error("Worker not found");

    const data: WorkerMessageRequestTemplate = {
      type: "init",
      payload: {
        driver: "modbus",
        network: {
          host: this.startConfig.host,
          port: this.startConfig.port,
        },
      },
    };

    this.worker.postMessage(data);
  }

  // Adicionar Validação de Retorno um dia!
  public setOutput(address: number, value: number) {
    if (!this.worker) throw new Error("Worker not found");

    const data: WorkerMessageRequestTemplate = {
      type: "command",
      payload: {
        id: crypto.randomUUID(),
        type: "write",
        payload: {
          type: "discrete",
          address,
          value,
        },
      },
    };

    this.worker.postMessage(data);

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
