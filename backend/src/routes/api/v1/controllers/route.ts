import { Supervisor } from "../../../../services/core/SupervisorService";

export const GET = async () => {
    console.log("GET /api/v1/controllers");
    const supervisor = Supervisor.getInstance();
    const controllers = supervisor.controllerManager.findAll();

    return Response.json({ controllers });
};

export const POST = async (req: any) => {
    const { name, driverName, startConfig } = await req.json();

    if (!name || !driverName || !startConfig) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supervisor = Supervisor.getInstance();

    const newController = supervisor.controllerManager.create({
        name,
        driverName,
        startConfig,
    });

    if (!newController) {
        return Response.json({ error: "Failed to create controller" }, { status: 500 });
    }

    return Response.json({ controller: newController });
};

export const PUT = async (req: any) => {
    const { name, driverName, startConfig } = await req.json();

    if (!name) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supervisor = Supervisor.getInstance();
    const controller = supervisor.controllerManager.findByName(name);

    if (!controller) {
        return Response.json({ error: "Controller not found" }, { status: 404 });
    }

    const newController = supervisor.controllerManager.updateByName(controller.name, {
        name: name ?? controller.name,
        driverName: driverName ?? controller.driverName,
        startConfig: startConfig ?? controller.startConfig,
    });

    return Response.json({ success: true, controller: newController });
};

export const DELETE = async (req: any) => {
    const { id } = await req.json();

    if (!id) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supervisor = Supervisor.getInstance();
    const controller = supervisor.controllerManager.findById(id);
    console.log(controller);

    if (!controller) {
        return Response.json({ error: "Controller not found" }, { status: 404 });
    }

    supervisor.controllerManager.remove(controller.name);

    return Response.json({ success: true, controller: controller });
};

