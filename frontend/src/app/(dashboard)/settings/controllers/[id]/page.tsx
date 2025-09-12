"use client"

import ModernHeader from "@/components/modern/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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

        setHost(controllerTemp.configs.network.host);
        setNewHost(controllerTemp.configs.network.host);

        setPort(controllerTemp.configs.network.port);
        setNewPort(controllerTemp.configs.network.port);
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
            console.log(newName, newDriver, newHost, newPort);

            if (!newName || !newDriver || !newHost || !newPort) {
                alert("Preencha todos os campos");
                return;
            }

            const response = await createController({
                name: newName,
                type: newDriver,
                configs: {
                    network: {
                        host: newHost,
                        port: newPort
                    }
                }
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

                        <div className="flex flex-col gap-2">
                            <label htmlFor="name">Nome</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={border}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="driver">Driver</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <select
                                    id="driver"
                                    name="driver"
                                    className={border}
                                    value={newDriver}
                                    onChange={(e) => setNewDriver(e.target.value)}
                                    disabled={!isNewController}
                                >
                                    <option value="mcp17">MCP17</option>
                                    <option value="mcp46a">MCP46A</option>
                                </select>
                            </div>
                        </div>


                        <div className="flex flex-col gap-2">
                            <label htmlFor="host">Host</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <input
                                    type="text"
                                    id="host"
                                    name="host"
                                    className={border}
                                    value={newHost}
                                    onChange={(e) => setNewHost(e.target.value)}
                                />
                            </div>
                        </div>


                        <div className="flex flex-col gap-2">
                            <label htmlFor="port">Porta</label>
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <input
                                    type="number"
                                    id="port"
                                    name="port"
                                    className={border}
                                    value={newPort}
                                    onChange={(e) => setNewPort(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

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