import type { Driver } from "./types/Driver.type";
import { join, dirname } from "path";

// Adicione mais imports conforme necessário

export class DriverService {
  private static drivers: Map<string, Driver> = new Map();

  static async loadDrivers(): Promise<Map<string, Driver>> {
    // Registre seus drivers aqui
    this.drivers.set('irport', {
      name: 'irport',
      path: join(dirname(__dirname), 'driver', 'drivers', 'irPort', 'worker.ts'),
      enabled: true
    });

    this.drivers.set('modbus', {
      name: 'modbus',
      path: join(dirname(__dirname), 'driver', 'drivers', 'modbus', 'worker.ts'),
      enabled: true
    });

    this.drivers.set('modbus_demo', {
      name: 'modbus_demo',
      path: join(dirname(__dirname), 'driver', 'drivers', 'modbus_demo', 'worker.ts'),
      enabled: true
    });

    return this.drivers;
  }

  static async getDriver(name: string): Promise<Driver | undefined> {
    if (this.drivers.size === 0) {
      await this.loadDrivers();
    }
    return this.drivers.get(name.toLowerCase());
  }
}
