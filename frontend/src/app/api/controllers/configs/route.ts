import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/apiProxy";

const CONTROLLERS_CONFIGS_API_URL = "/api/v1/controllers/configs";

export const GET = async (req: NextRequest) => {
    return proxyToBackend(req, CONTROLLERS_CONFIGS_API_URL);
};