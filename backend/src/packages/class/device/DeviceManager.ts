import EventEmitter from "events";
import { Device } from "../../../apps/backend/services/devices/Device";

export class DeviceManager extends EventEmitter {
    private devices: Map<string, Device> = new Map();
  
    constructor() {
      super();
    }

    addDevice(device: Device): DeviceManager {
      this.devices.set(device.id, device);
      return this;
    }
  
    removeDevice(id: string): boolean {
      const device = this.devices.get(id);
      if (!device) return false;
  
      try {
        device.stop();
        this.devices.delete(id);
        return true;
      } catch (error) {
        console.error(`Erro ao remover dispositivo ${id}:`, error);
        return false;
      }
    }
  
    getDevice(id: string): Device | undefined {
      return this.devices.get(id);
    }
  
    getAllDevices(): Device[] {
      return Array.from(this.devices.values());
    }
  
    getDevicesByDriver(driverName: string): Device[] {
      return Array.from(this.devices.values()).filter(
        (device) => device.driverName === driverName
      );
    }
  }
  