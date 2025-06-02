"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { NavItem, Sidebar, ToggleButton } from "@/app/style";
import { useTheme } from "@/contexts/ThemeContext";
import { SidebarContent } from "./SidebarContent";

export default function SidebarComponent() {
  const [isSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  return (
    <Sidebar isOpen={isSidebarOpen} isDark={isDark}>
      <ToggleButton isDark={isDark}>
        Mundo Logic
      </ToggleButton>

      <SidebarContent />

      <NavItem isActive={false} isDark={isDark} onClick={toggleTheme} style={{ cursor: "pointer", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {isDark ? (
            <>
              <Sun className="icon" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="icon" />
              <span>Modo Escuro</span>
            </>
          )}
        </div>
      </NavItem>
    </Sidebar>
  );
}
