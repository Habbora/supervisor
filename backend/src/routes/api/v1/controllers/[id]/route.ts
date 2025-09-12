import { controllerResponseDTO, createControllerDTO } from "@/services/controllers/controller/controller.dto";
import { ControllerManager } from "@services/controllers/manager";

// GET /api/v1/controllers/[id] - Buscar controller por ID
export const GET = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing controller ID",
                message: "Controller ID is required"
            }, { status: 400 });
        }

        const controller = ControllerManager.getInstance().findById(id);

        if (!controller) {
            return Response.json({
                error: "Controller not found",
                message: "Controller with this ID does not exist"
            }, { status: 404 });
        }

        const controllerDto = controllerResponseDTO.parse(controller);

        return Response.json(controllerDto);
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: "Failed to fetch controller"
        }, { status: 500 });
    }
}

export const PUT = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing controller ID",
                message: "Controller ID is required"
            }, { status: 400 });
        }

        const controllerDto = createControllerDTO.parse(await req.json());
        console.log(controllerDto);
        const newController = ControllerManager.getInstance().update(id, controllerDto);
        console.log(newController);
        const newControllerResponseDto = controllerResponseDTO.parse(newController);

        return Response.json({ success: true, controller: newControllerResponseDto }, { status: 200 });
    } catch (error) {
        return Response.json({
            error: "Internal server error",
        }, { status: 500 });
    }
}

// DELETE /api/v1/controllers/[id] - Deletar controller por ID
export const DELETE = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing controller ID",
                message: "Controller ID is required"
            }, { status: 400 });
        }

        const controller = ControllerManager.getInstance().remove(id);

        if (!controller) {
            return Response.json({
                error: "Controller not found",
                message: "Controller with this ID does not exist"
            }, { status: 404 });
        }

        return Response.json({ success: true, controller: controller });
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: "Failed to delete controller"
        }, { status: 500 });
    }
}
