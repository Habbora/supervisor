import { Device, type DeviceDTO } from "../Device";
import { DeviceError } from "../types/device.type";



export interface PumpDto extends DeviceDTO {
    type: "pump";
}

export class DevicePump extends Device {

    constructor(id: string, dto: PumpDto) {
        if (dto.type !== 'pump') throw new DeviceError('Tipo de dispositivo inválido');
        super(id, dto);
    }


}