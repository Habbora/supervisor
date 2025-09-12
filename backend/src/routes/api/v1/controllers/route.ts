import { controllerResponseDTO } from "@/services/controllers/controller/controller.dto";
import { ControllerManager } from "@services/controllers/manager";

export const GET = async () => {
    const controllers = ControllerManager.getInstance().findAll();
    const controllersDto = controllers.map((controller) => controllerResponseDTO.parse(controller));
    return Response.json(controllersDto);
};

export const POST = async (req: any) => {
    const { name, type, configs } = await req.json();

    if (!name || !type) {
        return Response.json({
            error: "Missing required fields",
            message: "name and interface are required"
        }, { status: 400 });
    }

    try {
        const newController = ControllerManager.getInstance().create({
            name,
            type,
            configs,
        });

        console.log(newController);

        return Response.json(newController);
    } catch (error) {
        return Response.json({ error: "Failed to create controller", message: error }, { status: 500 });
    }


};