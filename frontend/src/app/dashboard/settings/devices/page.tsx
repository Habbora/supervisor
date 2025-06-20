'use client'

import { useState } from "react";

// Interface para tipar os dispositivos
interface Device {
    id: number;
    name: string;
    description: string;
    type: string;
    status: "online" | "offline" | "error";
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([
        {
            id: 1,
            name: "Dispositivo 1",
            description: "Descrição do dispositivo 1",
            type: "sensor",
            status: "online",
        },
        {
            id: 2,
            name: "Dispositivo 2",
            description: "Descrição do dispositivo 2",
            type: "atuador",
            status: "offline",
        },
        {
            id: 3,
            name: "Dispositivo 3",
            description: "Descrição do dispositivo 3",
            type: "controlador",
            status: "error",
        },
        {
            id: 4,
            name: "Sensor de Temperatura",
            description: "Sensor para monitorar temperatura",
            type: "sensor",
            status: "online",
        },
        {
            id: 5,
            name: "Válvula Principal",
            description: "Válvula de controle principal",
            type: "atuador",
            status: "online",
        }
    ]);

    // Estados para os filtros
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");

    // Função para obter a cor do status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "online":
                return "text-green-600 bg-green-100";
            case "offline":
                return "text-gray-600 bg-gray-100";
            case "error":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    // Função para formatar a data
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    // Função para filtrar dispositivos
    const filteredDevices = devices.filter((device) => {
        const matchesName = device.name.toLowerCase().includes(filterName.toLowerCase());
        const matchesType = filterType === "" || device.type === filterType;
        return matchesName && matchesType;
    });

    // Obter tipos únicos para o filtro
    const uniqueTypes = [...new Set(devices.map(device => device.type))];

    // Função para limpar filtros
    const clearFilters = () => {
        setFilterName("");
        setFilterType("");
    };

    // Função para adicionar dispositivo (placeholder)
    const handleAddDevice = () => {
        alert("Funcionalidade de adicionar dispositivo será implementada!");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Dispositivos</h1>
                <button
                    onClick={handleAddDevice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Dispositivo
                </button>
            </div>
            
            {/* Menu de Filtros Slim */}
            <div className="mb-6 flex flex-wrap gap-4 items-end">
                {/* Filtro por Nome */}
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filtro por Tipo */}
                <div className="min-w-[150px]">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos os tipos</option>
                        {uniqueTypes.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botão Limpar Filtros */}
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Limpar
                </button>
            </div>

            {/* Resultados do Filtro */}
            <div className="mb-4 text-sm text-gray-600">
                <span>Mostrando {filteredDevices.length} de {devices.length} dispositivos</span>
                {(filterName || filterType) && (
                    <span className="ml-4 text-blue-600">
                        Filtros: 
                        {filterName && <span className="ml-1">"{filterName}"</span>}
                        {filterType && <span className="ml-1">Tipo: {filterType}</span>}
                    </span>
                )}
            </div>
            
            {/* Tabela responsiva */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                                ID
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                                Nome
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                                Descrição
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                                Tipo
                            </th>
                            <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDevices.map((device) => (
                            <tr key={device.id} className="hover:bg-gray-50">
                                <td className="border border-gray-200 px-4 py-3">
                                    {device.id}
                                </td>
                                <td className="border border-gray-200 px-4 py-3 font-medium">
                                    {device.name}
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    {device.description}
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <span className="capitalize">{device.type}</span>
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                                        {device.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Informações adicionais */}
            <div className="mt-6 text-sm text-gray-600">
                <p>Total de dispositivos: {devices.length}</p>
                <p>Dispositivos online: {devices.filter(d => d.status === 'online').length}</p>
            </div>
        </div>
    );
}