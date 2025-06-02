"use client";

import { useDashboard } from "@/contexts/dashboardContext";
import {
  FaHome,
  FaWater,
  FaLightbulb,
  FaTemperatureHigh,
  FaCog,
} from "react-icons/fa";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

const MenuItem = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: ${({ theme, active }) => (active ? theme.primary : theme.card)};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

export function SidebarContent() {
  const { state, setActiveScreen } = useDashboard();

  return (
    <Container>
      <MenuItem
        active={state.activeScreen === "home"}
        onClick={() => setActiveScreen("home")}
      >
        <FaHome /> Home
      </MenuItem>

      <MenuItem
        active={state.activeScreen === "lights"}
        onClick={() => setActiveScreen("lights")}
      >
        <FaLightbulb /> Iluminação
      </MenuItem>
    </Container>
  );
}
