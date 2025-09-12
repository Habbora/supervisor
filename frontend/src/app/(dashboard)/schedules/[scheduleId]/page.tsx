'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSchedules } from "@/features/schedules/hooks/useSchedules";
import { useDevices } from "@/features/device/hooks/useDevices";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceType } from "@/features/device/types";

export default function ScheduleIdPage() {
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const { schedules, isSchedulesLoaded } = useSchedules();
    const [schedule, setSchedule] = useState<any | null>(null);
    const [isNewSchedule, setIsNewSchedule] = useState<boolean>(false);

    const { devices, isDevicesLoaded } = useDevices();

    useEffect(() => {
        if (scheduleId === "new") {
            setIsNewSchedule(true);
            return;
        }
        
        setIsNewSchedule(false);
        setSchedule(schedules.find((schedule) => schedule.id === scheduleId));
    }, [scheduleId, isSchedulesLoaded]);

    useEffect(() => {
        if (!schedule) return;
        setNome(schedule?.name ?? "");
        setHora(`${schedule?.time.hour ?? "00"}:${schedule?.time.minute ?? "00"}`);
        setDispositivos(schedule?.actions ?? []);
    }, [schedule]);

    useEffect(() => {
        if (isDevicesLoaded) {
            const deviceWithAction = devices.filter((device) => device.actions && device.actions.length > 0);
            setDeviceWithAction(deviceWithAction);
        }
    }, [devices]);

    const [nome, setNome] = useState(schedule?.name ?? "");
    const [hora, setHora] = useState("");
    const [devicesWithAction, setDeviceWithAction] = useState<DeviceType[]>([]);
    const [dispositivos, setDispositivos] = useState<
        { deviceId: string; action: string; value: number }[]
    >([]);
    const [novoDispositivo, setNovoDispositivo] = useState({
        nome: "",
        acao: "",
        valor: "",
    });

    // Função para adicionar um dispositivo na lista
    function handleAdicionarDispositivo() {
        if (novoDispositivo.nome && novoDispositivo.acao) {
            setDispositivos([...dispositivos, novoDispositivo]);
            setNovoDispositivo({ nome: "", acao: "", valor: "" });
        }
    }

    // Função para remover um dispositivo da lista
    function handleRemoverDispositivo(index: number) {
        setDispositivos(dispositivos.filter((_, i) => i !== index));
    }

    // Função para enviar o formulário (aqui só vamos mostrar no console)
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Aqui você pode enviar os dados para o backend
        console.log({
            nome,
            hora,
            dispositivos,
        });
        alert("Agendamento salvo! Veja o console para os dados.");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isNewSchedule ? "Novo Agendamento" : "Agendamento"}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div>
                        <label className="block mb-1">Nome do Agendamento:</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Hora:</label>
                        <input
                            type="time"
                            value={hora}
                            onChange={e => setHora(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            required
                        />
                    </div>

                    {/* Tabela de dispositivos */}
                    <div>
                        <label className="block mb-2">Dispositivos:</label>
                        <table className="w-full border mb-2">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-1">Nome</th>
                                    <th className="border px-2 py-1">Ação</th>
                                    <th className="border px-2 py-1">Valor</th>
                                    <th className="border px-2 py-1">Remover</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dispositivos.map((d, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1">{devices.find((device) => device.id === d.nome)?.name ?? "Erro ao encontrar dispositivo"}</td>
                                        <td className="border px-2 py-1">{d.acao}</td>
                                        <td className="border px-2 py-1">{d.valor}</td>
                                        <td className="border px-2 py-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoverDispositivo(idx)}
                                                className="text-red-500"
                                            >
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Linha para adicionar novo dispositivo */}
                                <tr>
                                    <td className="border px-2 py-1">
                                        <select
                                            value={novoDispositivo.nome}
                                            onChange={e =>
                                                setNovoDispositivo({ ...novoDispositivo, nome: e.target.value })
                                            }
                                            className="border rounded px-1 py-0.5 w-full">
                                            {devicesWithAction.map((device) => (
                                                <option key={device.id} value={device.id}>
                                                    {device.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border px-2 py-1">
                                        <select
                                            value={novoDispositivo.acao}
                                            onChange={e =>
                                                setNovoDispositivo({ ...novoDispositivo, acao: e.target.value })
                                            }
                                            className="border rounded px-1 py-0.5 w-full"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="ligar">Ligar</option>
                                            <option value="desligar">Desligar</option>
                                            <option value="ajustar">Ajustar</option>
                                        </select>
                                    </td>
                                    <td className="border px-2 py-1">
                                        <input
                                            type="text"
                                            placeholder="Valor (se necessário)"
                                            value={novoDispositivo.valor}
                                            onChange={e =>
                                                setNovoDispositivo({ ...novoDispositivo, valor: e.target.value })
                                            }
                                            className="border rounded px-1 py-0.5 w-full"
                                        />
                                    </td>
                                    <td className="border px-2 py-1">
                                        <button
                                            type="button"
                                            onClick={handleAdicionarDispositivo}
                                            className="text-green-600"
                                        >
                                            Adicionar
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Salvar Agendamento
                    </button>
                </form>

                {/* 
                Explicação para leigos:
                - useState serve para guardar valores que mudam na tela.
                - Cada campo do formulário tem seu próprio estado.
                - Quando clica em "Adicionar", o dispositivo é colocado na lista.
                - Quando clica em "Remover", ele sai da lista.
                - Ao enviar, mostramos os dados no console.
            */}
            </CardContent>
        </Card>
    )
}