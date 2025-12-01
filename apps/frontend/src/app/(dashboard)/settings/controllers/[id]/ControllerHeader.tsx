import { ControllerType } from "@/features/controllers/types";
import { Network, Wifi, WifiOff } from "lucide-react";

interface ControllerHeaderProps {
    controller: ControllerType;
}
export function ControllerHeader({ controller }: ControllerHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Network className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{controller.name}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                    {controller.status.isConnected ? (
                        <>
                            <Wifi className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">Offline</span>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}