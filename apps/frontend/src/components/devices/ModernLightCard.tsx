'use client';

import { Light } from "@/types/devices/light.type";
import { Lightbulb, Zap, Power } from "lucide-react";
import { useState } from "react";

interface ModernLightCardProps {
  device: Light;
  onToggle: (deviceId: string) => void;
}

export function ModernLightCard({ device, onToggle }: ModernLightCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isOn = Boolean(device.value);
  const isOffline = device.isOnline === false;
  const hasAlert = device.isAlert === true;

  // Reduzir ID para exibição
  const shortId = device.id.length > 12 ? `${device.id.substring(0, 8)}...` : device.id;

  const handleClick = () => {
    if (isOffline) return;

    setIsAnimating(true);
    onToggle(device.id);

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer
        ${isOffline ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${isOn
          ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-amber-300 shadow-lg shadow-amber-200/50'
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-md'
        }
        ${hasAlert ? 'border-red-400 shadow-red-200/50' : ''}
        ${isAnimating ? 'animate-pulse' : ''}
      `}
    >
      {/* Glow effect quando ligada */}
      {isOn && !isOffline && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20 animate-pulse" />
      )}

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-lg mb-1 truncate ${isOn ? 'text-gray-900' : 'text-gray-700'}`}
              title={device.name}
            >
              {device.name}
            </h3>
            <p
              className="text-xs text-gray-500 truncate cursor-help"
              title={`ID completo: ${device.id}`}
            >
              ID: {shortId}
            </p>
          </div>

          {/* Icon com animação */}
          <div className={`
            relative p-3 rounded-full transition-all duration-300 flex-shrink-0
            ${isOn
              ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
              : 'bg-gray-100 group-hover:bg-gray-200'
            }
          `}>
            {isOn ? (
              <Zap className="w-6 h-6 text-white animate-pulse" strokeWidth={2.5} />
            ) : (
              <Lightbulb className="w-6 h-6 text-gray-600" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap
              ${isOn
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700'
              }
              ${isOffline ? 'bg-red-100 text-red-700' : ''}
            `}>
              <Power className="w-3 h-3 flex-shrink-0" />
              {isOffline ? 'Offline' : isOn ? 'Ligada' : 'Desligada'}
            </span>

            {hasAlert && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">
                ⚠️ Alerta
              </span>
            )}
          </div>

          {/* Indicator light */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isOn ? 'bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse' : 'bg-gray-300'}
              ${isOffline ? 'bg-red-500' : ''}
            `} />
          </div>
        </div>

        {/* Hover effect overlay */}
        {!isOffline && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
        )}
      </div>

      {/* Bottom accent line */}
      <div className={`
        h-1 w-full transition-all duration-300
        ${isOn
          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500'
          : 'bg-gray-200 group-hover:bg-gray-300'
        }
      `} />
    </div>
  );
}
