import styled, { createGlobalStyle } from "styled-components";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });
  
  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });
  

export const theme = {
  light: {
    background: "#f5f5f5",
    cardBackground: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666666",
    border: "#e0e0e0",
    borderHover: "#d0d0d0",
    shadow: "rgba(0, 0, 0, 0.1)",
    primary: "#2577e2",
    primaryHover: "#1b5ab0",
    success: "#4CAF50",
    successHover: "#43A047",
    danger: "#f44336",
    dangerHover: "#e53935",
    disabled: "#e0e0e0",
    disabledText: "#666666",
    gauge: {
      background: "#ffffff",
      level1: "#91b7f0",
      level2: "#52adf8",
      level3: "#2577e2",
      level4: "#05469c",
    }
  },
  dark: {
    background: "#121212",
    cardBackground: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#a0a0a0",
    border: "#333333",
    borderHover: "#404040",
    shadow: "rgba(0, 0, 0, 0.3)",
    primary: "#4b9eff",
    primaryHover: "#3d8cff",
    success: "#66bb6a",
    successHover: "#58a55e",
    danger: "#ef5350",
    dangerHover: "#e53935",
    disabled: "#2e2e2e",
    disabledText: "#808080",
    gauge: {
      background: "#404040",
      level1: "#6b9ae8",
      level2: "#4b9eff",
      level3: "#3d8cff",
      level4: "#2d6cd9",
    }
  },
};

export const GlobalStyle = createGlobalStyle<{ isDark: boolean }>`
  html {
    background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].background};
  }

  body {
    margin: 0;
    font-family: ${geistSans.variable}, ${geistMono.variable}, sans-serif;
    background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].background};
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    transition: background-color 0.3s ease, color 0.3s ease;
    min-height: 100vh;
    width: 100%;
  }

  #__next {
    min-height: 100vh;
    background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].background};
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  select, input, button {
    font-family: ${geistSans.variable}, ${geistMono.variable}, sans-serif;
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
    background: ${({ isDark }) => theme[isDark ? "dark" : "light"].cardBackground};
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].borderHover};
    }

    &:focus {
      outline: none;
      border-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].primary};
    }
  }
`;

export const TitlePage = styled.h1<{ isDark: boolean }>`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
`;

export const LayoutWrapper = styled.div<{ isDark: boolean }>`
  display: flex;
  min-height: 100vh;
  background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].background};
  transition: background-color 0.3s ease;
`;

export const Sidebar = styled.aside<{ isOpen: boolean; isDark: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  padding: 1rem;
  background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].cardBackground};
  border-right: 1px solid ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 10;

  @media (max-width: 768px) {
    transform: translateX(${({ isOpen }) => (isOpen ? "0" : "-100%")});
  }
`;

export const MainContent = styled.main<{ isDark: boolean }>`
  flex: 1;
  padding: 2rem;
  margin-left: 250px;
  max-width: 1400px;
  width: 100%;
  margin-right: auto;
  background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].background};
  transition: background-color 0.3s ease;

  @media (max-width: 1700px) {
    max-width: calc(100% - 250px);
  }

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100%;
    padding: 1rem;
  }
`;

export const ToggleButton = styled.button<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
  margin-bottom: 2rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].primary};
  }
`;

export const NavItem = styled.div<{ isActive: boolean; isDark: boolean }>`
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  background-color: ${({ isActive, isDark }) =>
    isActive ? theme[isDark ? "dark" : "light"].border : "transparent"};
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
  }

  a, div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    text-decoration: none;
    font-weight: ${({ isActive }) => (isActive ? "600" : "400")};

    .icon {
      width: 20px;
      height: 20px;
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
    }

    span {
      font-size: 0.875rem;
    }
  }
`;

// Estilos para o Dashboard
export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin: 0 auto;
`;

export const DashboardCard = styled.div<{ isDark: boolean }>`
  background: ${({ isDark }) => theme[isDark ? "dark" : "light"].cardBackground};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px ${({ isDark }) => theme[isDark ? "dark" : "light"].shadow};
  border: 1px solid ${({ isDark }) => theme[isDark ? "dark" : "light"].border};

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
  }

  h3 {
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
    font-size: 1rem;
    margin-top: 0.5rem;
  }

  p {
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
  }
`;

export const TabsContainer = styled.div<{ isDark: boolean }>`
  .tabs-list {
    background: ${({ isDark }) => theme[isDark ? "dark" : "light"].cardBackground};
    padding: 0.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid ${({ isDark }) => theme[isDark ? "dark" : "light"].border};

    @media (max-width: 640px) {
      flex-wrap: nowrap;
      justify-content: start;
    }
  }

  .tab {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: ${({ isDark }) => theme[isDark ? "dark" : "light"].textSecondary};
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: ${({ isDark }) => theme[isDark ? "dark" : "light"].border};
      color: ${({ isDark }) => theme[isDark ? "dark" : "light"].text};
    }

    &[data-state="active"] {
      background: ${({ isDark }) => theme[isDark ? "dark" : "light"].primary};
      color: #ffffff;
    }
  }
`;