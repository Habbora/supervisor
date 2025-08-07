import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    const controller = await fetch(`http://localhost:4001/api/v1/controllers/${id}`).then(res => res.json());

    return NextResponse.json(controller);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    console.log(request.body);
    const { id } = await params;

    const controller = await fetch(`http://localhost:4001/api/v1/controllers`, {
        method: "PUT",
        body: request.body,
    });

    return NextResponse.json(await controller.json());
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = await params;

    const data = await fetch(`http://localhost:4001/api/v1/controllers`, {
        method: "DELETE",
        body: JSON.stringify({
            id
        }),
    });

    return NextResponse.json(data);
}
