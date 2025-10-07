"use client"

// Uses
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { useDevices } from "@/features/device/hooks/useDevices";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeviceInputTable, { DeviceInput } from "@/components/devices/DeviceInputTable";

// Icons
import { Trash2 } from "lucide-react";
import InputText from "@/components/ui/form-v1/InputText";
import InputSelect from "@/components/ui/form-v1/InputSelect";
import Loading from "@/components/Loading";
import DeviceEndpointTable, { DeviceEndpoint } from "@/components/devices/DeviceEndpointTable";

export default function DeviceIdPage() {
    const { id } = useParams<{ id: string }>();

    const router = useRouter();

    const { controllers } = useControllers();
    const { createDevice, updateDevice, deleteDevice, getDeviceById } = useDevices();

    const [device, setDevice] = useState<any | null>(null);
    const [isDeviceLoaded, setIsDeviceLoaded] = useState<boolean>(false);

    // Estados para Formulário;
    const [isNewDevice, setIsNewDevice] = useState<boolean>(false);
    const [isChanged, setIsChanged] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [newName, setNewName] = useState<string>("");

    const [type, setType] = useState<string>("");
    const [newType, setNewType] = useState<string>("");

    const [deviceEndpoints, setDeviceEndpoints] = useState<DeviceEndpoint[]>([]);
    const [originalEndpoints, setOriginalEndpoints] = useState<DeviceEndpoint[]>([]);

    const [deviceInputs, setDeviceInputs] = useState<DeviceInput[]>([]);
    const [originalInputs, setOriginalInputs] = useState<DeviceInput[]>([]);

    useEffect(() => {
        if (id === "new") {
            setIsNewDevice(true);
            setIsDeviceLoaded(true);
            return;
        }
        else {
            getDeviceById(id).then((device) => {
                setDevice(device);
                setIsDeviceLoaded(true);
            });
        }
    }, [id]);

    useEffect(() => {
        if (id === "new") return;

        if (!isDeviceLoaded) return;

        if (!device) {
            router.push("/settings/devices");
            return;
        }

        setName(device.name);
        setNewName(device.name);
        setType(device.type);
        setNewType(device.type);

        if (device.endpoints && Array.isArray(device.endpoints)) {
            setDeviceEndpoints(device.endpoints);
            setOriginalEndpoints(device.endpoints);
        } else {
            setDeviceEndpoints([]);
            setOriginalEndpoints([]);
        }

        if (device.inputs && Array.isArray(device.inputs)) {
            setDeviceInputs(device.inputs);
            setOriginalInputs(device.inputs);
        } else {
            setDeviceInputs([]);
            setOriginalInputs([]);
        }

    }, [isDeviceLoaded]);

    useEffect(() => {
        const endpointsChanged = JSON.stringify(deviceEndpoints) !== JSON.stringify(originalEndpoints);
        const inputsChanged = JSON.stringify(deviceInputs) !== JSON.stringify(originalInputs);
        
        if (newName !== name || newType !== type || inputsChanged || endpointsChanged) {
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }

        console.log(newName, newType, deviceEndpoints, originalEndpoints, deviceInputs, originalInputs);
    }, [newName, newType, deviceEndpoints, deviceInputs]);
    

    const handleCreateOrUpdateDevice = async () => {
        // Criando um dispositivo
        if (isNewDevice) {
            if (!newName || !newType) {
                alert("Preencha todos os campos");
                return;
            }

            const device = await createDevice({
                name: newName,
                type: newType
            });

            if (device) {
                router.push(`/settings/devices/${device.id}`);
            }
            else {
                alert("Erro ao criar dispositivo");
            }

            return;
        }

        if (device) {
            const payload = {
                ...device,
                name: newName,
                type: newType,
                endpoints: deviceEndpoints,
                inputs: deviceInputs
            }

            const deviceUpdated = await updateDevice(device.id, payload);
            console.log('Deviced: ', deviceUpdated);
            setName(deviceUpdated.name);
            setType(deviceUpdated.type);
            setDeviceEndpoints(deviceUpdated.endpoints)
            setOriginalInputs(deviceUpdated.inputs);
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

    const handleDeviceEndpointChange = (name: string, controllerId: string, endpointName: string) => {
        setDeviceEndpoints(prev =>
            prev.map(endpoint =>
                endpoint.name === name
                    ? { ...endpoint, controllerId, endpointName }
                    : endpoint
            )
        );
    };

    const handleDeviceInputChange = (name: string, value: string | number | boolean) => {
        setDeviceInputs(prev =>
            prev.map(input =>
                input.name === name
                    ? { ...input, value }
                    : input
            )
        );
    };

    if (!isDeviceLoaded) {
        return (
            <>
                <div className="flex flex-col gap-2">
                    <ModernHeader title="⚙️ Configurações" subtitle="Dispositivos" />
                </div>
                <Loading />
            </>
        )
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
                        <InputText
                            id="name"
                            label="Nome do Dispositivo"
                            placeholder="Digite o nome do dispositivo"
                            value={newName}
                            onChange={(value) => setNewName(value)}
                        />

                        {/* Tipo do Dispositivo */}
                        <InputSelect
                            id="type"
                            label="Tipo do Dispositivo"
                            value={newType}
                            options={[
                                { name: "Selecione um tipo", value: "" },
                                { name: "Sensor de Nível", value: "level" },
                                { name: "Bomba", value: "pump" },
                                { name: "Luz", value: "light" },
                                { name: "Válvula", value: "valve" },
                                { name: "Sensor", value: "sensor" },
                                { name: "Atuador", value: "actuator" },
                                { name: "Pulso", value: "pulse" }]}
                            onChange={(value) => setNewType(value)}
                            disabled={!isNewDevice}
                        />

                        {!isNewDevice && (
                            <>
                                <DeviceEndpointTable
                                    endpoints={deviceEndpoints}
                                    controllers={controllers}
                                    onChange={handleDeviceEndpointChange}
                                    title="Configurações dos Endpoints"
                                />

                                {/* Tabela de inputs dinâmicos do device */}
                                <DeviceInputTable
                                    inputs={deviceInputs}
                                    onChange={handleDeviceInputChange}
                                    title="Configurações Avançadas do Dispositivo"
                                />
                            </>
                        )}

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