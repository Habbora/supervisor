import { useState, useEffect } from "react";

export interface PumpType {
  id: string;
  name: string;
  value?: number;
  isOnline?: boolean;
  isAlert?: boolean;
}

interface PumpControlProps {
  device: PumpType;
  className?: string;
}

export default function PumpControl({ device: device, className }: PumpControlProps) {

  function sendMessage(message: string) {
    console.log(message);
  }

  const handleToggle = () => {
    sendMessage(JSON.stringify({
      type: "pump",
      action: "toggle",
      id: device.id,
    }));
  };

  return (
    <div
      className={`w-[200px] h-[150px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 ${className}
        ${device.isAlert
          ? "bg-red-200 hover:bg-red-300"
          : "bg-green-200 hover:bg-green-300"
        }`}
      onClick={handleToggle}
    >
      <div className="h-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold">{device.name}</span>
        </div>
        <div className={`w-full h-full justify-center items-center flex rounded-lg ${device.isAlert ? "bg-red-500 text-white" : device.value
          ? "bg-green-500 text-black"
          : "bg-red-500 text-white"
          }`}>
          <span className="text-4xl font-bold leading-none">
            {device.isAlert ? "FALHA" : device.value ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
} 