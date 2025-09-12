import { DeviceDatabase } from "../database/devices";
import { Device, type DeviceDTO } from "./Device";
import { DeviceLevel, type LevelDto } from "./Level";
import { DevicePump, type PumpDto } from "./pump";

export class DeviceService {
    private static instance: DeviceService;
    private devices: Map<string, Device> = new Map();

    private constructor() {
        this.initDatabase();
    }

    public static getInstance() {
        if (!DeviceService.instance) DeviceService.instance = new DeviceService();
        return DeviceService.instance;
    }

    private initDatabase() {
        // Carrega os dispositivos do banco de dados
        const devices = DeviceDatabase.getInstance().findAll();

        // Cria os dispositivos
        devices.map((deviceDTO) => {
            switch (deviceDTO.type) {
                case "level":
                    return new DeviceLevel(deviceDTO.id, deviceDTO as LevelDto);
                case "pump":
                    return new DevicePump(deviceDTO.id, deviceDTO as PumpDto);
                default:
                    return new Device(deviceDTO.id, deviceDTO);
            }
        }).forEach((device) => this.devices.set(device.id, device));
    }

    public findAll(): Device[] {
        return Array.from(this.devices.values());
    }

    public findById(id: string): Device | undefined {
        return this.devices.get(id);
    }

    public create(deviceDTO: DeviceDTO): Device | undefined {
        if (!deviceDTO.name || !deviceDTO.type) return undefined;

        const newDeviceDto = DeviceDatabase.getInstance().create({
            name: deviceDTO.name,
            type: deviceDTO.type,
            endpoints: deviceDTO.endpoints,
        });

        if (!newDeviceDto) return undefined;

        const newDevice = new Device(newDeviceDto.id, newDeviceDto);
        this.devices.set(newDevice.id, newDevice);

        return newDevice;
    }

    public update(deviceId: string, deviceDTO: DeviceDTO): Device | undefined {
        const oldDevice = this.findById(deviceId);
        if (!oldDevice) return undefined;

        DeviceDatabase.getInstance().update({
            id: oldDevice.id,
            name: deviceDTO.name,
            type: deviceDTO.type,
            endpoints: deviceDTO.endpoints,
        });

        oldDevice.destroy();
        this.devices.set(deviceId, new Device(deviceId, deviceDTO));

        return this.findById(deviceId);
    }

    public remove(deviceId: string): Device | undefined {
        const oldDevice = this.findById(deviceId);
        if (!oldDevice) return undefined;

        oldDevice.destroy();
        this.devices.delete(deviceId);
        DeviceDatabase.getInstance().delete(oldDevice.id);

        return oldDevice;
    }
}