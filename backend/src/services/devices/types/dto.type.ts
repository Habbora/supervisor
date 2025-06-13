import type { Device } from "../../controller/Device";

export type DeviceDto = {
    id: string;
    name: string;
    type: string;
    controller?: Device;
    endpoint?: Map<number, string>;
}

export type DeviceControllerDto = Device