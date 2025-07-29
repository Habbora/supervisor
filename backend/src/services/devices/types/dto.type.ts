import type { Controller } from "../../controller/Controller";

export type DeviceDto = {
    id?: string;
    name: string;
    type: string;
    controller?: string;
    endpoint?: Map<number, {
        type: "analog_input" | "analog_output" | "digital_input" | "digital_output";
        controller: string;
        endpoint: string;
    }>;
}

export type DeviceControllerDto = Controller