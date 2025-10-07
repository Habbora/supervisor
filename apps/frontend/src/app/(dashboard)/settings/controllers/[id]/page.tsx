"use client"

// Uses
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useControllers } from "@/features/controllers/hooks/useControllers";

// Icons
import { Trash2 } from "lucide-react";

// Components
import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputText from "@/components/ui/form-v1/InputText";
import InputSelect from "@/components/ui/form-v1/InputSelect";
import InputNumber from "@/components/ui/form-v1/InputNumber";

const border = "border border-gray-300 rounded-md p-2 w-full"

export default function ControllerIdPage() {
    const router = useRouter();

    const { id } = useParams<{ id: string }>();
    const { controllers, updateController, deleteController, createController, isControllersLoaded } = useControllers();

    const [controller, setController] = useState<any | null>(null);

    const [name, setName] = useState<string>("");
    const [newName, setNewName] = useState<string>("");

    const [driver, setDriver] = useState<string>("");
    const [newDriver, setNewDriver] = useState<string>("");

    const [host, setHost] = useState<string>("");
    const [newHost, setNewHost] = useState<string>("");

    const [port, setPort] = useState<number>(0);
    const [newPort, setNewPort] = useState<number>(0);

    const [isNewController, setIsNewController] = useState<boolean>(false);
    const [isChanged, setIsChanged] = useState<boolean>(false);

    useEffect(() => {
        if (id === "new") {
            setIsNewController(true);
            return;
        }

        if (!isControllersLoaded) {
            return;
        }

        const controllerTemp = controllers.find((controller) => controller.id === id);
        if (!controllerTemp) {
            router.push("/settings/controllers");
            return;
        }

        setController(controllerTemp);

        setName(controllerTemp.name);
        setNewName(controllerTemp.name);

        setDriver(controllerTemp.type);
        setNewDriver(controllerTemp.type);

        setHost(controllerTemp.configs?.network?.host || "");
        setNewHost(controllerTemp.configs?.network?.host || "");

        setPort(controllerTemp.configs?.network?.port || 0);
        setNewPort(controllerTemp.configs?.network?.port || 0);
    }, [controllers, id]);

    useEffect(() => {
        if (newName !== name || newDriver !== driver || newHost !== host || newPort !== port) {
            setIsChanged(true);
        }
        else {
            setIsChanged(false);
        }
    }, [newName, newDriver, newHost, newPort]);

    const handleUpdateController = async () => {
        if (!id) {
            return;
        }

        if (isNewController) {
            console.log(newName, newDriver);

            if (!newName || !newDriver) {
                alert("Preencha todos os campos");
                return;
            }

            const response = await createController({
                name: newName,
                type: newDriver
            });

            if (response) {
                router.push(`/settings/controllers/${response.id}`);
            }
            else {
                alert("Erro ao criar controlador");
            }

            return;
        }

        const response = await updateController(id, {
            name: newName,
            type: driver,
            configs: {
                network: {
                    host: newHost,
                    port: newPort
                }
            }
        });

        if (response) {
            setName(response.name);
            setDriver(response.type);
            setHost(response.configs.network.host);
            setPort(response.configs.network.port);
            setIsChanged(false);
        }
    }

    const handleDelete = async () => {
        const confirmation = confirm("Tem certeza que deseja remover este controlador?");

        if (confirmation) {
            const response = await deleteController(id);
            if (response) {
                router.push("/settings/controllers");
            }
            else {
                alert("Erro ao remover controlador");
            }
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <ModernHeader title="⚙️ Configurações" subtitle="Controladores" />

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Configurações do Controlador</CardTitle>
                    {!isNewController && (
                        <Button variant="destructive" className="text-white gap-2" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                            Remover
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-2">

                        {!isNewController && (
                            <div>
                                <span>Status: </span>
                                <span>{controller?.status.connected ? "Conectado" : "Desconectado"}</span>
                            </div>
                        )}

                        <InputText
                            id="name"
                            label="Nome"
                            placeholder="Digite o nome do controlador"
                            value={newName}
                            onChange={(e) => setNewName(e)}
                        />

                        <InputSelect
                            id="driver"
                            label="Driver"
                            value={newDriver}
                            options={[{ name: "Selecione um driver", value: "" }, { name: "MCP17", value: "mcp17" }, { name: "MCP46A", value: "mcp46a" }]}
                            onChange={(e) => setNewDriver(e)}
                            disabled={!isNewController}
                        />

                        {!isNewController && (
                            <>
                                <InputText
                                    id="host"
                                    label="Host"
                                    placeholder="Digite o host do controlador"
                                    value={newHost}
                                    onChange={(e) => setNewHost(e)}
                                />

                                <InputNumber
                                    id="port"
                                    label="Porta"
                                    placeholder="Digite a porta do controlador"
                                    value={newPort}
                                    onChange={(e) => setNewPort(parseInt(e))}
                                />
                            </>
                        )}

                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!isChanged}
                            onClick={handleUpdateController}
                        >Salvar</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}