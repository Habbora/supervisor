"use client";

import { useEffect, useState } from "react";
import DashboardCard from "../DashboardCard";
import Lampada from "./Lampada";

export interface LampadaType {
  id: number;
  name: string;
  type: "dimmer" | "switch" | "pulse";
  status: number;
}

export interface IluminacaoGrupoProps {
  title: string;
  description?: string;
  lampadas: LampadaType[];
  handleToggle: (id: number) => void;
  handleLigar: () => void;
  handleDesligar: () => void;
}

export function IluminacaoGrupo({
  title,
  description,
  lampadas,
  handleToggle,
  handleLigar,
  handleDesligar,
}: IluminacaoGrupoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <DashboardCard>
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-gray-600 flex items-center gap-2 select-none"
          onClick={() => setIsExpanded(!isExpanded)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {title} ({lampadas.filter((lampada) => lampada.status > 0).length} /{" "}
          {lampadas.length})
        </h1>
        <div className="flex gap-2">
          <button
            className="bg-green-500 text-white p-2 rounded-md w-[100px] cursor-pointer hover:bg-green-600"
            onClick={handleLigar}
          >
            Ligar
          </button>
          <button
            className="bg-red-500 text-white p-2 rounded-md w-[100px] cursor-pointer hover:bg-red-600"
            onClick={handleDesligar}
          >
            Desligar
          </button>
        </div>
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {isExpanded && (
        <div className="flex flex-wrap gap-4 mt-4">
          {lampadas.map((lampada) => (
            <Lampada
              key={lampada.name}
              lampada={lampada}
              onToggle={() => handleToggle(lampada.id)}
            />
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
