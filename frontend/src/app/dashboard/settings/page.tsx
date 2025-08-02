"use client";

import DashboardTopMenu from "@/components/ui/dashboard/DashboardTopMenu";
import DashboardCard from "@/components/ui/dashboard/DashboardCard";

import { MdSettings } from "react-icons/md";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import SettingCard from "@/components/settings/SettingCard";

interface Controller {
    id: string;
    name: string;
    driverName: string;
    interface: string;
    startConfig: {
        host: string;
        port: number;
    };
}

interface Device {
    id: string;
    name: string;
    type: string;
}

export default function SettingsPage() {
    const [controllers, setControllers] = useState<Controller[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        fetch("http://localhost:4001/api/v1/controllers")
            .then(res => res.json())
            .then(data => setControllers(data.controllers));

        fetch("http://localhost:4001/api/v1/devices")
            .then(res => res.json())
            .then(data => setDevices(data.devices));
    }, []);

    const handleUpdateController = (controller: Controller) => {
        fetch("http://localhost:4001/api/v1/controllers", {
            method: "PUT",
            body: JSON.stringify(controller),
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    setControllers(controllers.map(c => c.id === controller.id ? data.controller : c));
                }
                console.log(controllers);
            });
    };

    const handleUpdateDevice = (device: Device) => {
        fetch("http://localhost:4001/api/v1/devices", {
            method: "PUT",
            body: JSON.stringify(device),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDevices(devices.map(d => d.id === device.id ? data.device : d));
                }
            });
    };

    return (
        <>
            <DashboardTopMenu title="Configurações" icon={MdSettings} />

            <div className="flex flex-col gap-4">
                <DashboardCard
                    title="Controladores"
                    icon={MdSettings}
                    color="var(--color-background-light)"
                    className="border-2 border-gray-200"
                >
                    <Button className="mb-2" onClick={() => { }}>Adicionar</Button>
                    <div className="flex flex-col gap-2">
                        {controllers.map((controller) => (
                            <DashboardCard
                                title={controller.name}
                                className="border-2 border-gray-200 cursor-pointer"
                                key={controller.id}
                            >
                                <div>
                                    <span>Driver Name:</span>
                                    <input type="text" value={controller.driverName ?? ""} onChange={(e) => setControllers(controllers.map((c) => c.id === controller.id ? { ...c, driverName: e.target.value } : c))} />
                                </div>
                                <div>
                                    <span>Interface:</span>
                                    <input type="text" value={controller.interface ?? ""} onChange={(e) => setControllers(controllers.map((c) => c.id === controller.id ? { ...c, interface: e.target.value } : c))} />
                                </div>
                                <div>
                                    <span>Start Config:</span>
                                    <div>
                                        <span>Host:</span>
                                        <input type="text" value={controller.startConfig.host ?? ""} onChange={(e) => setControllers(controllers.map((c) => c.id === controller.id ? { ...c, startConfig: { ...c.startConfig, host: e.target.value } } : c))} />
                                    </div>
                                    <div>
                                        <span>Port:</span>
                                        <input type="number" value={controller.startConfig.port ?? 0} onChange={(e) => setControllers(controllers.map((c) => c.id === controller.id ? { ...c, startConfig: { ...c.startConfig, port: parseInt(e.target.value) } } : c))} />
                                    </div>
                                </div>

                                <Button onClick={() => handleUpdateController(controller)}>Salvar</Button>
                            </DashboardCard>
                        ))}
                    </div>
                </DashboardCard>

                <DashboardCard
                    title="Dispositivos"
                    icon={MdSettings}
                    color="var(--color-background-light)"
                    className="border-2 border-gray-200"
                >
                    <div className="flex flex-col gap-2">
                        {devices.map((device) => (
                            <DashboardCard className="border-2 border-gray-200" key={device.id}>
                                <div>
                                    <span>Nome:</span>
                                    <input type="text" value={device.name} onChange={(e) => setDevices(devices.map((d) => d.id === device.id ? { ...d, name: e.target.value } : d))} />
                                </div>
                                <div>
                                    <span>Tipo:</span>
                                    <input type="text" value={device.type} onChange={(e) => setDevices(devices.map((d) => d.id === device.id ? { ...d, type: e.target.value } : d))} />
                                </div>
                                <Button onClick={() => handleUpdateDevice(device)}>Salvar</Button>
                            </DashboardCard>
                        ))}
                    </div>
                </DashboardCard>

                <SettingCard />
            </div>
        </>
    );
}