import { WebService } from "../communication";
import type { WebSocketResponse } from "./types/websocket";
import { EventBus } from "../event-bus/index.ts";
import { DeviceService } from "../devices/DeviceService";
import { HistoryManager } from "../history";

export class Dashboard {
  private __webService = new WebService();
  private __eventBus = EventBus.getInstance();
  private __deviceManager = DeviceService.getInstance();

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<this> {
    await this.__webService.initialize();
    this.__webService.on("open", () => this.handleOpenWebSocket());

    this.__eventBus.subscribe("device_value_changed", () => this.handleDeviceChange());
    this.__webService.on("message", (data: any) => this.__eventBus.publish("dashboard_message", data));

    return this;
  }

  private handleOpenWebSocket() {
    this.handleDeviceChange();
  }

  private handleOnMessage(data: any) {
    this.__eventBus.publish("dashboard_message", data);
  }

  private handleDeviceChange() {
    const devices = this.__deviceManager.findAll().map(device => device.toDashboard());

    const data: WebSocketResponse<any> = {
      type: "dashboard",
      code: 200,
      payload: {
        devices,
        history: [
          {
            name: "levelInferior",
            history: HistoryManager.getInstance().getDeviceHistory("levelInferior")?.getHistory(),
          },
          {
            name: "levelSuperior",
            history: HistoryManager.getInstance().getDeviceHistory("levelSuperior")?.getHistory(),
          },
        ],
      },
    };

    this.__webService.broadcast(data);
  }
}
