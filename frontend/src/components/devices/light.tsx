import type { Light } from "@/types/devices/light.type";

interface LightCardProps {
  device: Light;
  className?: string;
}

export default function LightCard({ device: device, className }: LightCardProps) {

  function sendMessage(message: string) {
    fetch(`/api/dashboard`, {
      method: "POST",
      body: message,
    });
  }

  const handleToggle = () => {
    sendMessage(JSON.stringify({
      id: device.id,
      action: "setToggle",
    }));
  };

  return (
    <div
      className={`w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${className}
        ${device.value
          ? "bg-green-100 hover:bg-green-200"
          : "bg-gray-100 hover:bg-gray-200"}
        `}
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
            {device.value ? "Ligado" : "Desligado"}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex flex-col gap-1">
        </div>
      </div>
    </div>
  );
} 