import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { GlobalStyle, LayoutWrapper, MainContent, Sidebar } from "./style";
import { DashboardProvider } from "../contexts/dashboardContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { SidebarContent } from "../components/Sidebar/SidebarContent";
import { AppRoutes } from "./routes";
import { Moon, Sun } from "lucide-react";

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  return (
    <LayoutWrapper isDark={isDark}>
      <GlobalStyle isDark={isDark} />
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
      <MainContent isDark={isDark}>
        <AppRoutes />
      </MainContent>
    </LayoutWrapper>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DashboardProvider>
          <AppContent />
        </DashboardProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 