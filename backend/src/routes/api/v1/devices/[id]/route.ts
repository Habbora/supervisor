import { DevicePatchDto } from "@/types/api/device.types";
import { DeviceService } from "@services/devices/DeviceService";
import { DeviceConverter } from "utils/deviceConverter";

export const GET = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;
        const device = DeviceService.getInstance().findById(id);

        if (!device) {
            return Response.json({
                error: "Device not found",
                message: "Device with this ID does not exist"
            }, { status: 404 });
        }

        const payload = DeviceConverter.toResponse(device);
        return Response.json(payload);
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: error as string
        }, { status: 500 });
    }
}

export const PATCH = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (req.headers.get('Content-Type') !== 'application/json') {
            return Response.json({
                error: "Invalid content type",
                message: "Content type must be application/json"
            }, { status: 400 });
        }

        const body = await req.json();
        const devicePatchDto = DevicePatchDto.parse(body);
        const device = DeviceService.getInstance().update(id, devicePatchDto);

        // TODO: Melhorar os tratamentos de erro...
        if (!device) {
            return Response.json({
                error: "Device not found",
                message: "Device with this ID does not exist"
            }, { status: 404 });
        }

        return Response.json(device, { status: 200 });
    } catch (error) {
        console.error('Error updating device: ', error);
        return Response.json({
            error: "Internal server error",
            message: "error: " + error
        }, { status: 500 });
    }
}

export const DELETE = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;
        const device = DeviceService.getInstance().remove(id);
        return Response.json(device, { status: 200 });
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: await error
        }, { status: 500 });
    }
}
