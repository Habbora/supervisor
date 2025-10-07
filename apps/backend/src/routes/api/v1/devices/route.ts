import { DeviceService } from "@services/devices/DeviceService";

export const GET = async (req: any) => {
    const devices = DeviceService.getInstance()
        .findAll()
        .map((device) => ({
            id: device.id,
            name: device.name,
            type: device.type,
            value: device.value,
            endpoints: device.endpoints,
            inputs: device.inputs,
            outputs: device.outputs,
        }));

    return Response.json(devices);
};

export const POST = async (req: any) => {
    const { name, type } = await req.json();

    if (!name || !type) {
        return Response.json({ error: "Name and type are required" }, { status: 400 });
    }

    const device = DeviceService.getInstance().newDevice({
        name,
        type,
    });

    if (!device) {
        return Response.json({ error: "Failed to create device" }, { status: 500 });
    }

    return Response.json(device, { status: 201 });
};
