import type { DeviceDto } from "./types/dto.type";
import { DeviceError, type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { EventBus } from "../EventBus";
import { Device } from "./Device";

export type LevelDto = DeviceDto & {
    type: "level";
}

export class DeviceLevel extends Device {

    constructor(dto: LevelDto) {
        if (dto.type !== 'level') {
            throw new DeviceError('Tipo de dispositivo inválido');
        }
        super(dto);
    }
}
