'use client';

export interface ControlerType {
    id: string;
    name: string;
    worker: {
        isRunning: boolean;
    };
    network: {
        type: string;
        host: string;
        port: number;
        isConnected?: boolean;
    };
}

interface ControllerCardProps {
    device: ControlerType;
    onClick?: () => void;
}

export default function ControllerCard({ device: device, onClick }: ControllerCardProps) {
    const isConnected = device.network.isConnected;
    const isRunning = device.worker.isRunning;

    return (
        <>
            <div
                className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${!isRunning
                    ? "bg-red-100 hover:bg-red-200"
                    : isConnected
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                onClick={onClick}
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${!isRunning ? "bg-red-500" : isConnected ? "bg-green-500" : "bg-gray-500"}`}
                        />
                        <span className="text-sm text-gray-600">
                            {!isRunning ? "Falha" : isConnected ? "Conectado" : "Desconectado"}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <div>IP: {device.network.host || ""}</div>
                        <div>Porta: {device.network.port || ""}</div>
                    </div>
                </div>
            </div>
        </>
    );
} 