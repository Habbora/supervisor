import { NextResponse } from "next/server";

interface FetchedController {
    id: string;
    name: string;
    driverName: string;
    interface: string;
    startConfig: {
        host: string;
        port: number;
    },
    isReady: boolean;
    worker: {
        isRunning: boolean;
    },
    network: {
        type: string;
        host: string;
        port: number;
        isConnected: boolean;
    }
}

interface ResponseController {
    id: string;
    name: string;
    driverName: string;
    interface: string;
    isReady: boolean;
    worker: {
        isRunning: boolean;
    }
    network: {
        type: string;
        host: string;
        port: number;
    };
}

export async function GET(request: Request) {
    const data = await fetch('http://localhost:4001/api/v1/controllers').then(res => res.json());

    const controllers: ResponseController[] = data.controllers.map((controller: FetchedController) => ({
        id: controller.id,
        name: controller.name,
        driverName: controller.driverName,
        interface: controller.interface,
        isReady: controller.isReady,
        worker: {
            isRunning: controller.worker.isRunning,
        },
        network: {
            type: "tcp",
            host: controller.startConfig.host,
            port: controller.startConfig.port,
            isConnected: controller.network.isConnected,
        },
    }));

    return NextResponse.json(controllers);
}

export async function POST(request: Request) {
    const { name, driverName, network } = await request.json();

    const data = await fetch(`http://localhost:4001/api/v1/controllers`, {
        method: "POST",
        body: JSON.stringify({
            name,
            driverName,
            startConfig: {
                host: network.host,
                port: network.port,
            },
        }),
    });

    return NextResponse.json(data);
}   
