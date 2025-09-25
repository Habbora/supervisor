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

export default function DeviceIdPage() {
    const { id } = useParams<{ id: string }>();

    const router = useRouter();

    const { controllers } = useControllers();
    const { createDevice, updateDevice, deleteDevice, getDeviceById } = useDevices();

    const [device, setDevice] = useState<any | null>(null);
    const [isDeviceLoaded, setIsDeviceLoaded] = useState<boolean>(false);

    // Estados para Formulário;
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
        if (id === "new") {
            setIsNewDevice(true);
            return;
        }

        if (!isDeviceLoaded) {
            return;
        }

        if (!device) {
            router.push("/settings/devices");
            return;
        }

        setName(device.name);
        setNewName(device.name);
        setType(device.type);
        setNewType(device.type);

        // Carregar inputs do device se existirem
        if (device.inputs && Array.isArray(device.inputs)) {
            setDeviceInputs(device.inputs);
            setOriginalInputs(device.inputs);
        } else {
            setDeviceInputs([]);
            setOriginalInputs([]);
        }

        if (device.endpoints.some((endpoint: any) => endpoint.name === 'default')) {
            setControllerId(device.endpoints.find((endpoint: any) => endpoint.name === 'default')?.controllerId ?? "");
            setNewControllerId(device.endpoints.find((endpoint: any) => endpoint.name === 'default')?.controllerId ?? "");
            setEndpointName(device.endpoints.find((endpoint: any) => endpoint.name === 'default')?.endpointName ?? "");
            setNewEndpointName(device.endpoints.find((endpoint: any) => endpoint.name === 'default')?.endpointName ?? "");
        }

    }, [isDeviceLoaded]);

    useEffect(() => {
        // Verificar se os inputs mudaram
        const inputsChanged = JSON.stringify(deviceInputs) !== JSON.stringify(originalInputs);

        if (newName !== name || newType !== type || newControllerId !== controllerId || newEndpointName !== endpointName || inputsChanged) {
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }
    }, [newName, newType, newControllerId, newEndpointName, deviceInputs, originalInputs]);

    // Função para lidar com mudanças nos inputs do device
    const handleDeviceInputChange = (name: string, value: string | number | boolean) => {
        setDeviceInputs(prev =>
            prev.map(input =>
                input.name === name
                    ? { ...input, value }
                    : input
            )
        );
    };

    const handleCreateOrUpdateDevice = async () => {
        // Criando um dispositivo
        if (isNewDevice) {
            if (!newName || !newType) {
                alert("Preencha todos os campos");
                return;
            }

            const device = await createDevice({
                name: newName,
                type: newType,
                endpoints: [{
                    name: 'default',
                    controllerId: "",
                    endpointName: ""
                }],
                inputs: deviceInputs
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
                endpoints: [{
                    name: 'default',
                    controllerId: newControllerId,
                    endpointName: newEndpointName
                }],
                inputs: deviceInputs
            }

            const deviceUpdated = await updateDevice(device.id, payload);
            setName(deviceUpdated.name);
            setType(deviceUpdated.type);
            setControllerId(deviceUpdated.endpoints.find((endpoint: any) => endpoint.name === 'default')?.controllerId ?? "");
            setEndpointName(deviceUpdated.endpoints.find((endpoint: any) => endpoint.name === 'default')?.endpointName ?? "");
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
                            options={[{ name: "Selecione um tipo", value: "" }, { name: "Sensor de Nível", value: "level" }, { name: "Bomba", value: "pump" }, { name: "Luz", value: "light" }, { name: "Válvula", value: "valve" }, { name: "Sensor", value: "sensor" }, { name: "Atuador", value: "actuator" }]}
                            onChange={(value) => setNewType(value)}
                            disabled={!isNewDevice}
                        />

                        {!isNewDevice && (
                            <>
                                {/* Controlador Associado */}
                                <InputSelect
                                    id="controller"
                                    label="Controlador Associado"
                                    value={newControllerId}
                                    options={[{ name: "Selecione um controlador", value: "" }, ...controllers.map((controller) => ({ name: `${controller.name} (${controller.type})`, value: controller.id }))]}
                                    onChange={(value) => setNewControllerId(value)}
                                />

                                {/* Nome do Endpoint */}
                                <InputSelect
                                    id="endpoint"
                                    label="Nome do Endpoint"
                                    value={newEndpointName}
                                    options={[{ name: "Selecione um endpoint", value: "" }, ...(controllers.find((controller) => controller.id === newControllerId)?.endpoints?.map((endpoint) => ({ name: endpoint.name, value: endpoint.name })) || [])]}
                                    onChange={(value) => setNewEndpointName(value)}
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