'use client';

import { WebSocketProvider } from "@/ws/WebSocketProvider";
import DashboardSideBar from "@/components/DashboardSideBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <WebSocketProvider>
        <div className="h-10">
        </div>
        {/* Main Content */}
        <div
          className="flex"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          {/* Sidebar */}
          <DashboardSideBar />

          {/* Main Content */}
          <div className="flex flex-col w-full">
            {children}
          </div>
        </div>
      </WebSocketProvider>
    </ProtectedRoute>
  );
}
