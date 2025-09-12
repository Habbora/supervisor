import { useWebSocket } from "@/ws/useWebSocket"; // Verificar se o useWebSocket está sendo usado corretamente, se consome muita memória
import { useState, useEffect } from "react";

import { ToggleCommand } from "@/types/websocket/command.type";

export interface Switch {
    id: string;
    name: string;
    value?: number | boolean;
    isOnline?: boolean;
    isAlert?: boolean;
}

interface SwitchCardProps {
    device: Switch;
    className?: string;
}

export default function SwitchCard({ device: device, className }: SwitchCardProps) {
    const { sendMessage } = useWebSocket();

    const [messageError, setMessageError] = useState<string>("Dispositivo offline");

    useEffect(() => {
        if (device.isOnline === true) setMessageError("");
        if (device.isOnline === false) setMessageError("Dispositivo offline");
    }, [device.isOnline]);

    useEffect(() => {
        if (device.isOnline === false) return;
        if (device.isAlert === false) setMessageError("");
        if (device.isAlert === true) setMessageError("Dispositivo com falha");
    }, [device.isAlert]);

    const handleToggle = () => {
        if (messageError) return;

        const payload: ToggleCommand = {
            deviceId: device.id,
            action: "toggle",
        }

        sendMessage(JSON.stringify(payload));
    };

    return (
        <div
            className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${className} ${messageError
                    ? "bg-red-100 hover:bg-red-200"
                    : device.value
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-gray-100 hover:bg-gray-200"
                }`}
            onClick={handleToggle}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="font-medium">{device.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={`w-3 h-3 rounded-full ${messageError ? "bg-red-500" : device.value ? "bg-green-500" : "bg-gray-500"
                            }`}
                    />
                    <span className="text-sm text-gray-600">
                        {messageError ? messageError : device.value ? "Ligada" : "Desligada"}
                    </span>
                </div>
                <div className="text-xs text-gray-500 flex flex-col gap-1">
                </div>
            </div>
        </div>
    );
} 