"use client";

import ModernHeader from "@/components/modern/modern-header";
import { useDevices } from "@/features/device/hooks/useDevices";
import { AddCard } from "@/components/AddCard";
import DeviceDisplayCard from "@/components/devices/display/DeviceDisplayCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { DeviceType } from "@/features/device/types";

export default function DevicesPage() {
    const router = useRouter();

    const { devices } = useDevices();

    function handleDeviceClick(device: DeviceType) {
        router.push(`/settings/devices/${device.id}`);
    }

    function handleAddDevice() {
        router.push("/settings/devices/new");
    }

    return (
        <>
            <ModernHeader title="⚙️ Configurações" subtitle="Dispositivos" />

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Dispositivos ( {devices.length} )</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {devices.map((device) => (
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