import type { Controller } from "../../controller/Controller";

export type DeviceDto = {
    id: string;
    name: string;
    type: string;
    controller?: Controller;
    endpoint?: Map<number, string>;
}

export type DeviceControllerDto = Controller