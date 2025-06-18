'use client';

import { DashboardProvider } from "@/contexts/DashboardContext";
import DashboardSideBar from "@/components/DashboardSideBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <DashboardProvider>
        <div
          className="flex min-h-screen"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          {/* Sidebar */}
          <div className="sticky top-0 h-screen">
            <DashboardSideBar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </DashboardProvider>
    </ProtectedRoute>
  );
}
