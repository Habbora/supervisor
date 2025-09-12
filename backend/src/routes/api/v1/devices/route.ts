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
        }));

    return Response.json(devices);
};

export const POST = async (req: any) => {
    const { name, type, endpoints } = await req.json();

    if (!name || !type) {
        return Response.json({ error: "Name and type are required" }, { status: 400 });
    }

    const device = DeviceService.getInstance().create({
        name,
        type,
        endpoints: endpoints ?? [],
    });

    if (!device) {
        return Response.json({ error: "Failed to create device" }, { status: 500 });
    }

    return Response.json({ device }, { status: 201 });
};

export const PUT = async (req: any) => {
    const { id, name, type, endpoints } = await req.json();

    if (!id || !name || !type || !endpoints) {
        return Response.json({ error: "ID, name, type and endpoints are required" }, { status: 400 });
    }

    const device = DeviceService.getInstance().update(id, {
        name,
        type,
        endpoints,
    });

    if (!device) {
        return Response.json({ error: "Failed to update device" }, { status: 500 });
    }

    return Response.json({ device });
};

export const DELETE = async (req: any) => {
    const { id } = await req.json();

    if (!id) {
        return Response.json({ error: "Device ID is required" }, { status: 400 });
    }

    const device = DeviceService.getInstance().remove(id);

    if (!device) {
        return Response.json({ error: "Device not found" }, { status: 404 });
    }

    return Response.json({ success: true, device: device });
};