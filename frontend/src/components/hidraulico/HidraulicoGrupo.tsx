"use client";

import { useState } from "react";
import DashboardCard from "../DashboardCard";
import LevelSensor, { LevelSensorType } from "./LevelSensor";
import ControleValvula, { ValvulaType } from "../hidraulico/ControleValvula";
import ControleBomba, { BombaType } from "./PumpControl";
import PressaoSensor, { PressaoType } from "../hidraulico/PressaoSensor";
import Hidrometro, { HidrometroType } from "../hidraulico/Hidrometro";

export interface HidraulicoGrupo {
  id: number;
  name: string;
  description?: string;
  niveis?: LevelSensorType[];
  pressoes?: PressaoType[];
  hidrometros?: HidrometroType[];
  valvulas?: ValvulaType[];
  bombas?: BombaType[];
}

export interface HidraulicoGrupoProps {
  title: string;
  description?: string;
  // Sensores
  niveis?: LevelSensorType[];
  pressoes?: PressaoType[];
  hidrometros?: HidrometroType[];
  // Controles
  valvulas?: ValvulaType[];
  bombas?: BombaType[];
  // Callbacks
  onToggleNivel?: (id: number) => void;
  onTogglePressao?: (id: number) => void;
  onToggleValvula?: (id: number) => void;
  onToggleBomba?: (id: number) => void;
  onLigarTudo?: () => void;
  onDesligarTudo?: () => void;
}

export function HidraulicoGrupo({
  title,
  description,
  niveis = [],
  pressoes = [],
  hidrometros = [],
  valvulas = [],
  bombas = [],
  onToggleNivel = () => {},
  onTogglePressao = () => {},
  onToggleValvula = () => {},
  onToggleBomba = () => {},
  onLigarTudo = () => {},
  onDesligarTudo = () => {},
}: HidraulicoGrupoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalControlesAtivos = valvulas.filter(v => v.isOpen).length + bombas.filter(b => b.isOn).length;
  const totalControles = valvulas.length + bombas.length;

  return (
    <DashboardCard>
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-blue-600 flex items-center gap-2 select-none"
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
          {title}
        </h1>
      </div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {isExpanded && (
        <div className="flex flex-col gap-8 mt-4">
          {/* Seção de Controles */}
          {(valvulas.length > 0 || bombas.length > 0) && (
            <div className="border-b pb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-700">Controles ({totalControlesAtivos} / {totalControles})</h2>
              </div>

              {valvulas.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2 text-green-600">Válvulas</h3>
                  <div className="flex flex-wrap gap-4">
                    {valvulas.map((valvula) => (
                      <ControleValvula
                        key={valvula.id}
                        valvula={valvula}
                        onToggle={() => onToggleValvula(valvula.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bombas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2 text-orange-600">Bombas</h3>
                  <div className="flex flex-wrap gap-4">
                    {bombas.map((bomba) => (
                      <ControleBomba
                        key={bomba.id}
                        bomba={bomba}
                        onToggle={() => onToggleBomba(bomba.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção de Níveis */}
          {niveis.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-cyan-600">Níveis</h2>
              <div className="flex flex-wrap gap-4">
                {niveis.map((nivel) => (
                  <LevelSensor
                    key={nivel.id}
                    sensor={nivel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção de Pressão */}
          {pressoes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-purple-600">Pressão</h2>
              <div className="flex flex-wrap gap-4">
                {pressoes.map((pressao) => (
                  <PressaoSensor
                    key={pressao.id}
                    sensor={pressao}
                    onToggle={() => onTogglePressao?.(pressao.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção de Hidrômetros */}
          {hidrometros.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-600">Hidrômetros</h2>
              <div className="flex flex-wrap gap-4">
                {hidrometros.map((hidrometro) => (
                  <Hidrometro
                    key={hidrometro.id}
                    hidrometro={hidrometro}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  );
}
