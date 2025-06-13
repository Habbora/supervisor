import type { Device } from "../../controller/Device";

export type DeviceDto = {
    id: string;
    name: string;
    type: string;
    controller?: Device;
    endpoint?: string[];
}

export type DeviceControllerDto = {
    controller: Device;
    endpoint: string[];
}