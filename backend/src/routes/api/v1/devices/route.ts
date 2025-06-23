import type { IDevice } from "../../../../services/devices/types/device.type";
import type { DeviceDto } from "../../../../services/devices/types/dto.type";

export const GET = async (req: any) => {
    const devices: IDevice[] = (global as any).deviceManager.getDevices();

    const devicesDto: DeviceDto[] = devices.map((device) => {
        return {
            id: device.id,
            name: device.name,
            type: device.type,
        };
    });

    return new Response(JSON.stringify(devicesDto), { status: 200 });
};
