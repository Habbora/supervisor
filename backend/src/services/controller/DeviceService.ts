import { Controller } from "./Controller";
import { DatabaseService } from "../database/DatabaseService";
import { BaseService } from "../abstracts/BaseService";
import type CreateDeviceDto from "./types/CreateDevice.dto";

export class DeviceService extends BaseService {
  private devices: Map<string, Controller> = new Map();

  constructor(
    private databaseService: DatabaseService,
  ) {
    super("DeviceService");
  }

  async initialize(): Promise<this> {
    try {
      console.log("Inicializando DeviceService...");
      const devices = await this.databaseService.find<CreateDeviceDto>("devices");
      devices.forEach(
        async (deviceConfig: CreateDeviceDto) => {
          const device = new Controller(deviceConfig);
          this.devices.set(device.name, device);
        }
      );
      console.log(`DeviceService inicializado com sucesso! ${this.devices.size} devices encontrados.`);
    } catch (error) {
      console.error("Erro ao inicializar DeviceService:", error);
      throw error;
    }

    return this;
  }

  async destroy(): Promise<void> {
    this.devices.clear();
    await super.destroy();
  }

  getDevice(name: string): Controller | undefined {
    return this.devices.get(name);
  }

  getDeviceByName(name: string): Controller | undefined {
    return this.devices.get(name);
  }

  getAllDevices(): Controller[] {
    return Array.from(this.devices.values());
  }

  addDevice(device: Controller) {
    const deviceDto: CreateDeviceDto = {
      name: device.name,
      driverName: device.driverName,
      startConfig: device.startConfig
    };

    this.databaseService.create("devices", deviceDto);
    this.devices.set(device.name, device);
  }

  removeDevice(deviceName: string) {
    this.databaseService.delete("devices", deviceName);
    this.devices.delete(deviceName);
  }

  updateDevice(deviceName: string, device: Partial<Controller>) {
    this.databaseService.update("devices", deviceName, device);
    this.devices.set(deviceName, { ...this.devices.get(deviceName), ...device } as Controller);
  }
}
