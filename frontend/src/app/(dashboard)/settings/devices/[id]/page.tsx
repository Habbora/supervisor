"use client"

import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { useDevices } from "@/features/device/hooks/useDevices";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const border = "border border-gray-300 rounded-md p-2 w-full"

export default function DeviceIdPage() {
    const router = useRouter();

    const { id } = useParams<{ id: string }>();
    const { controllers, isControllersLoaded } = useControllers();
    const { devices, createDevice, updateDevice, deleteDevice } = useDevices();

    const [device, setDevice] = useState<any | null>(null);
    const [isDevicesLoaded, setIsDevicesLoaded] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [newName, setNewName] = useState<string>("");

    const [type, setType] = useState<string>("");
    const [newType, setNewType] = useState<string>("");

    const [controllerId, setControllerId] = useState<string>("");
    const [newControllerId, setNewControllerId] = useState<string>("");

    const [endpointName, setEndpointName] = useState<string>("");
    const [newEndpointName, setNewEndpointName] = useState<string>("");

    const [isNewDevice, setIsNewDevice] = useState<boolean>(false);
    const [isChanged, setIsChanged] = useState<boolean>(false);

    useEffect(() => {
        console.log('Rodando useEffect!');

        if (id === "new") {
            setIsNewDevice(true);
            return;
        }

        console.log('Controllers Loaded: ', isControllersLoaded);

        if (!isControllersLoaded) {
            return;
        }

        const deviceTemp = devices.find((device) => device.id === id);
        if (!deviceTemp) {
            router.push("/settings/devices");
            return;
        }

        console.log('Device Temp: ', deviceTemp);

        setDevice(deviceTemp);

        setName(deviceTemp.name);
        setNewName(deviceTemp.name);

        setType(deviceTemp.type);
        setNewType(deviceTemp.type);

        if (deviceTemp.endpoints.some((endpoint) => endpoint.name === 'default')) {
            setControllerId(deviceTemp.endpoints.find((endpoint) => endpoint.name === 'default')?.controllerId ?? "");
            setNewControllerId(deviceTemp.endpoints.find((endpoint) => endpoint.name === 'default')?.controllerId ?? "");
            setEndpointName(deviceTemp.endpoints.find((endpoint) => endpoint.name === 'default')?.endpointName ?? "");
            setNewEndpointName(deviceTemp.endpoints.find((endpoint) => endpoint.name === 'default')?.endpointName ?? "");
        }

    }, [isDevicesLoaded, isControllersLoaded]);

    useEffect(() => {
        if (newName !== name || newType !== type || newControllerId !== controllerId || newEndpointName !== endpointName) {
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }
    }, [newName, newType, newControllerId, newEndpointName]);

    const handleCreateOrUpdateDevice = async () => {
        // Criando um dispositivo
        if (isNewDevice) {
            if (!newName || !newType || !newControllerId || !newEndpointName) {
                alert("Preencha todos os campos");
                return;
            }

            await createDevice({
                name: newName,
                type: newType,
                endpoints: [{
                    name: 'default',
                    controllerId: newControllerId,
                    endpointName: newEndpointName
                }]
            });

            router.push("/settings/devices");
            return;
        }

        // Atualizando um dispositivo
        if (device) {
            await updateDevice({
                ...device,
                name: newName,
                type: newType,
                endpoints: [{
                    name: 'default',
                    controllerId: newControllerId,
                    endpointName: newEndpointName
                }]
            });

            setName(newName);
            setType(newType);
            setControllerId(newControllerId);
            setEndpointName(newEndpointName);
            setIsChanged(false);
        }
    }

    const handleDelete = async () => {
        const confirmation = confirm("Tem certeza que deseja remover este dispositivo?");

        if (confirmation && device) {
            await deleteDevice(device);
            router.push("/settings/devices");
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <ModernHeader title="⚙️ Configurações" subtitle="Dispositivos" />

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Configurações do Dispositivo</CardTitle>
                    {!isNewDevice && (
                        <Button variant="destructive" className="text-white gap-2" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                            Remover
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-2">

                        {/* Nome do Dispositivo */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name">Nome do Dispositivo</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={border}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Digite o nome do dispositivo"
                                />
                            </div>
                        </div>

                        {/* Tipo do Dispositivo */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="type">Tipo do Dispositivo</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <select
                                    id="type"
                                    name="type"
                                    className={border}
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="level">Sensor de Nível</option>
                                    <option value="pump">Bomba</option>
                                    <option value="light">Luz</option>
                                    <option value="valve">Válvula</option>
                                    <option value="sensor">Sensor</option>
                                    <option value="actuator">Atuador</option>
                                </select>
                            </div>
                        </div>

                        {/* Controlador Associado */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="controller">Controlador Associado</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <select
                                    id="controller"
                                    name="controller"
                                    className={border}
                                    value={newControllerId}
                                    onChange={(e) => setNewControllerId(e.target.value)}
                                    disabled={!isControllersLoaded}
                                >
                                    <option value="">Selecione um controlador</option>
                                    {controllers.length > 0 && controllers.map((controller) => (
                                        <option key={controller.id} value={controller.id}>
                                            {controller.name} ({controller.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nome do Endpoint */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="endpoint">Nome do Endpoint</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <select
                                    id="endpoint"
                                    name="endpoint"
                                    className={border}
                                    value={newEndpointName}
                                    onChange={(e) => setNewEndpointName(e.target.value)}
                                >
                                    <option value="">Selecione um endpoint</option>
                                    {controllers.find((controller) => controller.id === newControllerId)
                                        ?.endpoints
                                        ?.map((endpoint) => (
                                            <option key={endpoint.name} value={endpoint.name}>
                                                {endpoint.name.toUpperCase()}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Botão de Salvar */}
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!isChanged}
                            onClick={handleCreateOrUpdateDevice}
                        >Salvar</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}