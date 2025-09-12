import { proxyToBackend } from "@/lib/apiProxy";
import { NextRequest, NextResponse } from "next/server";

const DEVICE_API_URL = "/api/v1/devices";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `${DEVICE_API_URL}/${id}`);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const deviceData = await request.json();

    const device = await fetch(`http://localhost:4001/api/v1/devices`, {
        method: "PUT",
        body: JSON.stringify(deviceData),
    });

    return NextResponse.json(await device.json());
}

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return proxyToBackend(req, `${DEVICE_API_URL}/${id}`);
}
