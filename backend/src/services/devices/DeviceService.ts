import { DeviceDatabase } from "../database/devices";
import type { DeviceSchema } from "../database/devices/schema";
import { EventBus } from "../event-bus";
import { Device, type DeviceDTO, type DeviceUpdateDTO } from "./Device";
import { DeviceLevel, type LevelDto } from "./Level";
import { Light } from "./Light";
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
        DeviceDatabase
            .getInstance()
            .findAll()
            .forEach((deviceDTO) => {
                const device = this.createDevice(deviceDTO);
                if (device) this.devices.set(device.id, device);
            });
    }

    private createDevice(deviceDTO: DeviceSchema): Device {
        switch (deviceDTO.type) {
            case "light":
                return new Light(deviceDTO.id, deviceDTO as any);
            case "level":
                return new DeviceLevel(deviceDTO.id, deviceDTO as LevelDto);
            case "pump":
                return new DevicePump(deviceDTO.id, deviceDTO as PumpDto);
            default:
                return new Device(deviceDTO.id, deviceDTO);
        }
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

    public update(id: string, deviceDTO: DeviceUpdateDTO): Device | undefined {
        const oldDevice = this.findById(id);
        if (!oldDevice) return undefined;
        const newDeviceDto = DeviceDatabase.getInstance().update(id, deviceDTO);
        if (!newDeviceDto) return undefined;
        const newDevice = this.createDevice(newDeviceDto);
        newDevice.value = oldDevice.value;
        this.devices.set(id, newDevice);
        oldDevice.destroy();
        return newDevice;
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