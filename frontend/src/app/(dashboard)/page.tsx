"use client";

import { useDevices } from "@/features/device/hooks/useDevices";

import DeviceDisplayCard from "@/components/devices/display/DeviceDisplayCard";
import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function DashboardPage() {
    const { devices } = useDevices();

    return (
        <>
            <ModernHeader title="Dashboard" />
            <Card>
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