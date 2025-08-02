import { Supervisor } from "../../../../services/core/SupervisorService";

export const GET = async (req: any) => {
    const supervisor = Supervisor.getInstance();
    const devices = supervisor.deviceManager.findAll();

    return Response.json({
        devices: devices.map((device) => ({
            id: device.id,
            name: device.name,
            type: device.type,
            endpoints: device.endpoints,
        }))
    });
};

export const POST = async (req: any) => {
    const { name, type, endpoints } = await req.json();

    if (!name || !type) {
        return Response.json({ error: "Name and type are required" }, { status: 400 });
    }

    const device = Supervisor.getInstance().deviceManager.create({
        name,
        type,
        endpoints: endpoints ?? [],
    });

    if (!device) {
        return Response.json({ error: "Failed to create device" }, { status: 500 });
    }

    return Response.json({ device });
};

export const PUT = async (req: any) => {
    const { id, name, type, endpoints } = await req.json();

    if (!id || !name || !type || !endpoints) {
        return Response.json({ error: "ID, name, type and endpoints are required" }, { status: 400 });
    }

    const supervisor = Supervisor.getInstance();
    const device = supervisor.deviceManager.update(id, {
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

    const supervisor = Supervisor.getInstance();
    const device = supervisor.deviceManager.remove(id);

    if (!device) {
        return Response.json({ error: "Device not found" }, { status: 404 });
    }

    return Response.json({ success: true, device: device });
};