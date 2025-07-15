import type { Controller } from "../../controller/Controller";

export type DeviceDto = {
    name: string;
    type: string;
    controller?: string;
    endpoint?: Map<number, string>;
}

export type DeviceControllerDto = Controller