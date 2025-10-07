import { ControllerManager } from "@/services/controllers/manager";

export const GET = async (req: Request & { params: Record<string, string> }) => {
    try {
        return Response.json({ message: "Endpoints fetched successfully" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: "Failed to fetch endpoints", message: error }, { status: 500 });
    }
};

