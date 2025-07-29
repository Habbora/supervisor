import { NextResponse } from "next/server";

let mockControllers: any[] = [
    {
        id: '1',
        name: 'CLP1',
        driverName: 'mcp46a',
        host: '192.168.0.240',
        port: 502,
        status: 'online',
    },
    {
        id: '2',
        name: 'CLP2',
        driverName: 'mcp17',
        host: '192.168.1.100',
        port: 502,
        status: 'offline',
    }
];

export async function GET(request: Request) {
    return NextResponse.json(mockControllers);
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    mockControllers = mockControllers.filter(controller => controller.id !== id);
    return NextResponse.json({ message: 'Controller deleted successfully' });
}

