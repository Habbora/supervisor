import { DeviceDatabase } from "../../database/devices";
import { Device, type DeviceDTO } from "./Device";
import { DeviceLevel, type LevelDto } from "./Level";
import { DevicePump, type PumpDto } from "./pump";

export class DeviceManager {
    private static instance: DeviceManager;
    private devices: Device[] = [];

    private constructor() {
        this.initDatabase();
    }

    public static getInstance() {
        if (!DeviceManager.instance) DeviceManager.instance = new DeviceManager();
        return DeviceManager.instance;
    }

    private initDatabase() {
        const devices = DeviceDatabase.getInstance().findAll();
        devices.map((deviceDTO) => {
            switch (deviceDTO.type) {
                case "level":
                    return new DeviceLevel(deviceDTO.id, deviceDTO as LevelDto);
                case "pump":
                    return new DevicePump(deviceDTO.id, deviceDTO as PumpDto);
                default:
                    return new Device(deviceDTO.id, deviceDTO);
            }
        }).forEach((device) => this.create(device));
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
        this.devices.push(newDevice);

        return newDevice;
    }

    public findAll(): Device[] {
        return this.devices;
    }

    public findById(id: string): Device | undefined {
        return this.devices.find((device) => device.id === id);
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
        this.devices = this.devices.map((device) => device.id === deviceId ? new Device(deviceId, deviceDTO) : device);

        return this.findById(deviceId);
    }

    public remove(deviceId: string): Device | undefined {
        const oldDevice = this.findById(deviceId);
        if (!oldDevice) return undefined;

        oldDevice.destroy();
        this.devices = this.devices.filter((device) => device.id !== deviceId);
        DeviceDatabase.getInstance().delete(oldDevice.id);

        return oldDevice;
    }
}