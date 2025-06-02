w"use client";

import { useDashboard } from "@/contexts/dashboardContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DashboardCard, DashboardGrid, TitlePage, theme } from "@/app/style";
import { Power, AlertTriangle, RotateCcw } from "lucide-react";
import styled from "styled-components";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PumpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin: 1rem 0;
`;

const PumpCard = styled.div<{ isDark: boolean; isOn: boolean; hasError: boolean }>`
  background: ${({ isDark }) => theme[isDark ? "dark" : "light"].cardBackground};
  border: 1px solid ${({ isDark, hasError }) => 
    hasError 
      ? theme[isDark ? "dark" : "light"].danger
      : theme[isDark ? "dark" : "light"].border};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;

    h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    span {
      font-size: 0.875rem;
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
    }
  }

  button {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &.toggle {
      background-color: ${({ isDark, isOn, hasError }) =>
        hasError
          ? 'transparent'
          : isOn
          ? theme[isDark ? "dark" : "light"].success
          : theme[isDark ? "dark" : "light"].danger};
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};

      &:hover {
        background-color: ${({ isDark, isOn, hasError }) =>
          hasError
            ? 'transparent'
            : isOn
            ? theme[isDark ? "dark" : "light"].successHover
            : theme[isDark ? "dark" : "light"].dangerHover};
      }

      &:disabled {
        background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].disabled};
        color: ${({ isDark }) => theme[isDark ? "dark" : "light"].disabledText};
        cursor: not-allowed;
      }
    }

    &.reset {
      background: none;
      border: 1px solid ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
      margin-top: 0.5rem;

      &:hover {
        background: ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
      }
    }
  }
`;

export function WatersSection() {
  const { state, setPumpStatus, resetPumpHours } = useDashboard();
  const { isDark } = useTheme();
  const currentTheme = theme[isDark ? "dark" : "light"];

  return (
    <>
      <TitlePage isDark={isDark}>Monitoramento</TitlePage>
      <DashboardGrid>
        {state.reservoirsBuilding.map((reservoir) => (
          <DashboardCard key={reservoir.id} isDark={isDark}>
            <h2>{reservoir.name}</h2>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...reservoir.reservoirs[0].readings].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.border} />
                  <XAxis stroke={currentTheme.text} />
                  <YAxis stroke={currentTheme.text} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: currentTheme.cardBackground,
                      border: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="superior" 
                    name="Nível Superior" 
                    stroke={currentTheme.primary} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inferior" 
                    name="Nível Inferior" 
                    stroke={currentTheme.success} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <PumpGrid>
              {reservoir.pumps.map((pump) => (
                <PumpCard 
                  key={pump.id} 
                  isDark={isDark} 
                  isOn={pump.isOn}
                  hasError={pump.hasError}
                >
                  <div className="header">
                    <h4>{pump.name}</h4>
                    <div className="status">
                      {pump.hasError && (
                        <AlertTriangle 
                          size={16} 
                          color={currentTheme.danger}
                        />
                      )}
                      <Power 
                        size={16} 
                        color={pump.isOn ? currentTheme.success : currentTheme.disabledText}
                      />
                    </div>
                  </div>

                  <div className="info">
                    <span>Horas de Operação:</span>
                    <span>{pump.hoursOn}h</span>
                  </div>

                  <button
                    className="toggle"
                    onClick={() => setPumpStatus(reservoir.id, pump.id, !pump.isOn)}
                    disabled={pump.hasError}
                  >
                    <Power size={16} />
                    {pump.isOn ? "Desligar" : "Ligar"}
                  </button>

                  <button
                    className="reset"
                    onClick={() => resetPumpHours(reservoir.id, pump.id)}
                  >
                    <RotateCcw size={16} />
                    Resetar Horas
                  </button>
                </PumpCard>
              ))}
            </PumpGrid>
          </DashboardCard>
        ))}
      </DashboardGrid>
    </>
  );
} 