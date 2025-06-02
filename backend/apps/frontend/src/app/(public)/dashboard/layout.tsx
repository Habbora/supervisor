"use client";

import { LayoutWrapper, MainContent } from "@/app/style";
import SidebarComponent from "@/components/Sidebar/Sidebar";
import { DashboardProvider } from "@/contexts/dashboardContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();

  return (
    <DashboardProvider>
      <LayoutWrapper isDark={isDark}>
        <SidebarComponent />
        <MainContent isDark={isDark}>{children}</MainContent>
      </LayoutWrapper>
    </DashboardProvider>
  );
}
