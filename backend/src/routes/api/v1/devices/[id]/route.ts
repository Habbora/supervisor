import { DeviceService } from "@services/devices/DeviceService";

// GET /api/v1/devices/[id] - Buscar dispositivo por ID
export const GET = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing device ID",
                message: "Device ID is required"
            }, { status: 400 });
        }

        const device = DeviceService.getInstance().findById(id);

        if (!device) {
            return Response.json({
                error: "Device not found",
                message: "Device with this ID does not exist"
            }, { status: 404 });
        }

        return Response.json(device);
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: "Failed to fetch device"
        }, { status: 500 });
    }
}