import { WebService } from "../communication";
import type { WebSocketResponse } from "./types/websocket";
import { EventBus } from "../EventBus";
import { DeviceManager } from "../devices/DeviceManager";
import { HistoryManager } from "../history";

export class Dashboard {
  private __webService = new WebService();
  private __eventBus: EventBus;
  private __deviceManager: DeviceManager;

  constructor(eventBus: EventBus, deviceManager: DeviceManager) {
    this.__eventBus = eventBus;
    this.__deviceManager = deviceManager;
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
    const devices = Array.from(this.__deviceManager.devices.values()).map(device => device.toDashboard());

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
