import { Device } from "./Device";
import type { DeviceDto } from "./types/dto.type";
import { DeviceError } from "./types/device.type";

type LightDto = DeviceDto & {
    type: "light";
}

export class Light extends Device {

    constructor(dto: LightDto) {
        if (dto.type !== 'light') {
            throw new DeviceError('Tipo de dispositivo inválido');
        }

        super(dto);
    }

}