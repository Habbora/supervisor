"use client";

import { useRouter } from "next/navigation";
import { useDashboard } from "@/features/dashboard/provider/dashboardProvider";

import ModernHeader from "@/components/modern/modern-header";
import { AddCard } from "@/components/AddCard";
import DeviceDisplayCard from "@/components/devices/display/DeviceDisplayCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceType } from "@/features/device/types";

export default function DevicesPage() {
    const router = useRouter();

    const { devices } = useDashboard();

    function handleDeviceClick(device: DeviceType) {
        router.push(`/settings/devices/${device.id}`);
    }

    function handleAddDevice() {
        router.push("/settings/devices/new");
    }

    return (
        <>
            <ModernHeader title="⚙️ Configurações" subtitle="Dispositivos" />

            <Card className="h-full overflow-y-auto">
                <CardHeader>
                    <CardTitle>Lista de Dispositivos ( {devices.length} )</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {devices.map((device: DeviceType) => (
                            <DeviceDisplayCard key={`device-${device.id}`} device={device}
                                onClick={() => handleDeviceClick(device)} />
                        ))}

                        <AddCard title="Adicionar Dispositivo" onClick={handleAddDevice} />
                    </div>
                </CardContent>
            </Card>
        </>
    )
}