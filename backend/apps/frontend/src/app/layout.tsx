"use client";

import "./globals.css";
import { useState } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DashboardProvider } from "../contexts/dashboardContext";
import {
  LayoutWrapper,
  MainContent,
  NavItem,
  Sidebar,
  ToggleButton,
} from "./style";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ChevronLeft,
  ChevronRight,
  LampCeiling,
  LayoutDashboard,
  Thermometer,
  Moon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "../contexts/ThemeContext";
import { SidebarContent } from "../components/Sidebar/SidebarContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  return (
    <LayoutWrapper isDark={isDark}>
      <Sidebar isOpen={isSidebarOpen} isDark={isDark}>
        <button
          onClick={toggleTheme}
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem",
            cursor: "pointer",
            color: isDark ? "#fff" : "#1a1a1a",
            position: "absolute",
            right: "1rem",
            top: "1rem",
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <SidebarContent />
      </Sidebar>
      <MainContent isDark={isDark}>{children}</MainContent>
    </LayoutWrapper>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <DashboardProvider>
            <LayoutContent>{children}</LayoutContent>
          </DashboardProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
