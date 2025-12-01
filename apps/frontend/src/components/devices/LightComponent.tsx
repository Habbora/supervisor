import type { Light } from "@/types/devices/light.type";

interface LightComponentProps {
  device: Light;
  className?: string;
}

export function LightComponent({ device: device, className }: LightComponentProps) {

  function sendMessage(payload: unknown) {
    fetch(`/api/dashboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  const isOn = Boolean(device.value);

  const handleToggle = () => {
    sendMessage({
      id: device.id,
      action: "setToggle",
    });
  };

  return (
    <div
      className={`flex w-75 h-25 p-2 rounded-xl cursor-pointer select-none transition-all duration-200 shadow-sm hover:shadow-md border ${isOn ? "bg-green-50/60 border-green-200 hover:bg-green-100" : "bg-gray-50/60 border-gray-200 hover:bg-gray-100"} ${className}`}
      onClick={handleToggle}
    >
      <div className="flex flex-col h-full w-full">

        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-800 truncate pb-2">{device.name}</span>
          <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${isOn ? "bg-green-600/10 text-green-700" : "bg-gray-600/10 text-gray-700"}`}>
            {isOn ? "Ligado" : "Desligado"}
          </span>
        </div>

        <div className="flex items-end justify-end h-full w-full">
          <div className="text-xs text-gray-500 truncate">
            ID: {device.id}
          </div>

        </div>
      </div>
    </div>
  );
}