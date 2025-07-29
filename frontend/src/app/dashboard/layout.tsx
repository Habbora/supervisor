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
        {/* Top Menu */}
        <div className="sticky top-0 h-10 bg-red-500 items-center justify-center">
          <div>Top Menu</div>
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
