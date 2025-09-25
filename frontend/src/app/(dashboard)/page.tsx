"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/features/dashboard/provider/dashboardProvider";

import DeviceDisplayCard from "@/components/devices/display/DeviceDisplayCard";
import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const { dashboard } = useDashboard();
    const [ devices, setDevices ] = useState<any[]>([]);
    const [ controllers, setControllers ] = useState<any[]>([]);
    
    useEffect(() => {
        setDevices(dashboard.devices);
        setControllers(dashboard.controllers);
    }, [dashboard]);

    useEffect(() => {
        console.log(dashboard);
    }, [dashboard]);

    return (
        <>
            <ModernHeader title="Dashboard" />
            <Card className="h-full overflow-y-auto">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {devices.map((device) => (
                            <DeviceDisplayCard key={`device-${device.id}`} device={device}
                                onClick={() => { }} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>

    );
}