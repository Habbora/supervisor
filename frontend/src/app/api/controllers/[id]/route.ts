import { NextRequest, NextResponse } from "next/server";

const CONTROLLER_API_URL = "http://localhost:4001/api/v1/controllers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const controller = await fetch(`${CONTROLLER_API_URL}/${id}`).then(res => res.json());

    return NextResponse.json(controller);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const controllerData = await req.json();

    const controller = await fetch(`${CONTROLLER_API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(controllerData),
    });

    return NextResponse.json(await controller.json());
}

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const controller = await fetch(`${CONTROLLER_API_URL}/${id}`, {
        method: "DELETE",
    });

    console.log(await controller.json());

    return NextResponse.json(await controller.json());
}
