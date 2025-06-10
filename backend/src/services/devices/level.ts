import EventEmitter from "events";
import type { Device } from "../controller/Device";

export interface LevelDto {
    id: string;
    name: string;
    value: number;
    controller?: Device;
    endpoint?: string;
}

interface ControllerConfig {
    controller: any;
    endpoint: string;
}

export class Level extends EventEmitter {
    private id: string;
    private name: string;
    private value: number;
    private controller?: Device;
    private endpoint?: string;

    constructor(dto: LevelDto) {
        super();
        this.id = dto.id;
        this.name = dto.name;
        this.value = dto.value;
        this.controller = dto.controller ?? undefined;
        this.endpoint = dto.endpoint ?? undefined;
    }

    private onDeviceEvent(data: any) {
        console.log(data);
    }

    setController(config: ControllerConfig) {
        config.controller.on("endpoint:" + config.endpoint, this.onDeviceEvent);
        this.controller = config.controller;
        this.endpoint = config.endpoint;
    }

    removeController() {
        this.controller?.off("endpoint:" + this.endpoint, this.onDeviceEvent);
        this.controller = undefined;
    }

    get getDevice() {
        return this.controller;
    }

}