import { useWebSocket } from "@/ws/useWebSocket";
import { useState, useEffect } from "react";
import type { Light } from "@/types/devices/light.type";

interface LightCardProps {
  device: Light;
  className?: string;
}

export default function LightCard({ device: device, className }: LightCardProps) {
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
    sendMessage(JSON.stringify({
      id: device.id,
      type: "light",
      action: "toggle",
    }));
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
          <span className="text-sm text-gray-600">
            💡
          </span>
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