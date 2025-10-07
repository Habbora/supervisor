import type { IDevice } from "./devices/types/device.type";

type CreateDeviceDto = {
    name: string;
    type: string;
    controller: string;
    endpoint: string;
}

export class DeviceFactory {
    private static instance: DeviceFactory;

    public static getInstance(): DeviceFactory {
        if (!DeviceFactory.instance) {
            DeviceFactory.instance = new DeviceFactory();
        }
        return DeviceFactory.instance;
    }

    public createDevice(deviceDto: CreateDeviceDto): IDevice {

    }
}
