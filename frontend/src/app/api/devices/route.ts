import { proxyToBackend } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

const DEVICE_API_URL = "/api/v1/devices";

export async function GET(request: NextRequest) {
    return proxyToBackend(request, DEVICE_API_URL);
}

export async function POST(request: NextRequest) {
    console.log(request);
    return proxyToBackend(request, DEVICE_API_URL);
}