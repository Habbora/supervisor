import fs from "fs";
import path from "path";

type ConnectionType = "modbus" | "tcp" | "udp" | "http" | "bacnet";

interface ModbusEndpoint {
  digital_output: Array<{
    name: string;
    address: number;
  }>;
  digital_input: Array<{
    name: string;
    address: number;
  }>;
  analog_output: Array<{
    name: string;
    address: number;
  }>;
  analog_input: Array<{
    name: string;
    address: number;
  }>;
}

interface TcpEndpoint {
  digital_output: Array<{
    name: string;
    command: string;
  }>;
  digital_input: Array<{
    name: string;
    command: string;
  }>;
  analog_output: Array<{
    name: string;
    command: string;
  }>;
  analog_input: Array<{
    name: string;
    command: string;
  }>;
}

interface UdpEndpoint {
  digital_output: Array<{
    name: string;
    command: string;
  }>;
  digital_input: Array<{
    name: string;
    command: string;
  }>;
  analog_output: Array<{
    name: string;
    command: string;
  }>;
  analog_input: Array<{
    name: string;
    command: string;
  }>;
}

interface HttpEndpoint {
  digital_output: Array<{
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
  }>;
  digital_input: Array<{
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
  }>;
  analog_output: Array<{
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
  }>;
  analog_input: Array<{
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
  }>;
}

interface BacnetEndpoint {
  digital_output: Array<{
    name: string;
    object_id: number;
    instance_id: number;
  }>;
  digital_input: Array<{
    name: string;
    object_id: number;
    instance_id: number;
  }>;
  analog_output: Array<{
    name: string;
    object_id: number;
    instance_id: number;
  }>;
  analog_input: Array<{
    name: string;
    object_id: number;
    instance_id: number;
  }>;
}

type Endpoints<T extends ConnectionType> = T extends "modbus" ? ModbusEndpoint :
  T extends "tcp" ? TcpEndpoint :
  T extends "udp" ? UdpEndpoint :
  T extends "http" ? HttpEndpoint :
  T extends "bacnet" ? BacnetEndpoint :
  never;

interface Device<T extends ConnectionType = ConnectionType> {
  type: "device";
  name: string;
  connection: T;
  endpoints: Endpoints<T>;
}

interface Config {
  devices: Device[];
}

export class ConfigDb {
  private static readonly CONFIG_PATH = path.join(
    __dirname,
    "../../.data/config.json"
  );

  public static readConfig(): Config {
    try {
      const configData = fs.readFileSync(this.CONFIG_PATH, "utf-8");
      return JSON.parse(configData) as Config;
    } catch (error) {
      console.error("Erro ao ler arquivo de configuração:", error);
      throw error;
    }
  }

  public static writeConfig(config: Config): void {
    try {
      const configString = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.CONFIG_PATH, configString, "utf-8");
    } catch (error) {
      console.error("Erro ao escrever no arquivo de configuração:", error);
      throw error;
    }
  }

  public static getDevices(): Device[] {
    return this.readConfig().devices;
  }

  public static updateDevice(deviceName: string, updatedDevice: Device): void {
    const config = this.readConfig();
    const deviceIndex = config.devices.findIndex(
      (device) => device.name === deviceName
    );

    if (deviceIndex === -1) {
      throw new Error(`Dispositivo ${deviceName} não encontrado`);
    }

    config.devices[deviceIndex] = updatedDevice;
    this.writeConfig(config);
  }

  public static addDevice<T extends ConnectionType>(newDevice: Device<T>): void {
    const config = this.readConfig();
    config.devices.push(newDevice);
    this.writeConfig(config);
  }

  public static removeDevice(deviceName: string): void {
    const config = this.readConfig();
    config.devices = config.devices.filter(
      (device) => device.name !== deviceName
    );
    this.writeConfig(config);
  }
}
