"use client";

import { useDashboard } from "@/contexts/dashboardContext";
import { DashboadLights } from "@/components/dashboard/DashboardLights";
import SimpleBarCharts from "@/components/charts/SimpleBarCharts";

export default function DashboardPage() {
  const { state } = useDashboard();

  const renderContent = () => {
    switch (state.activeScreen) {
      case "lights":
        return <DashboadLights />;
      default:
        return (
          <>  
            <DashboadLights />
            <SimpleBarCharts />
          </>
        );
    }
  };

  return <>{renderContent()}</>;
}
