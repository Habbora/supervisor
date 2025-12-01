"use client"

import { useState } from "react";
import { ControllerType, Endpoint } from "@/features/controllers/types";
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Trash2,
    Plus,
    Network,
    Wifi,
    WifiOff,
    Settings,
    CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControllersTableProps {
    controllers: ControllerType[];
    onEditController: (controller: ControllerType) => void;
    onDeleteController: (id: string) => void;
    onAddEndpoint: (controllerId: string) => void;
    onEditEndpoint: (controllerId: string, endpoint: Endpoint) => void;
    onDeleteEndpoint: (controllerId: string, endpointId: string) => void;
}

export function ControllersTable({
    controllers,
    onEditController,
    onDeleteController,
    onAddEndpoint,
    onEditEndpoint,
    onDeleteEndpoint
}: ControllersTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                        <th className="w-10 px-4 py-3"></th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Nome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Driver
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Endpoints
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {controllers.map((controller) => {
                        const isExpanded = expandedRows.has(controller.id);
                        const hasEndpoints = (controller.endpoints?.length || 0) > 0;

                        return (
                            <>
                                {/* Linha Principal do Controlador */}
                                <tr
                                    key={controller.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {/* Botão Expandir */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleRow(controller.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            title={isExpanded ? "Recolher" : "Expandir"}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-gray-600" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        {controller.status.isConnected ? (
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-medium text-green-700">Online</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <WifiOff className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-medium text-red-700">Offline</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Nome */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Network className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{controller.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{controller.id}</p>
                                    </td>

                                    {/* Driver */}
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {controller.driver}
                                        </span>
                                    </td>

                                    {/* Endpoints */}
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600">
                                            {controller.endpoints?.length || 0}
                                        </span>
                                    </td>

                                    {/* Ações */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onEditController(controller)}
                                                className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                                                title="Editar controlador"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteController(controller.id)}
                                                className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                                                title="Remover controlador"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Linha Expandida - Endpoints */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan={7} className="bg-gray-50 px-4 py-4">
                                            <div className="ml-8">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                        <Settings className="w-4 h-4" />
                                                        Endpoints do Controlador
                                                    </h4>
                                                    <Button
                                                        onClick={() => onAddEndpoint(controller.id)}
                                                        size="sm"
                                                        className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        Adicionar Endpoint
                                                    </Button>
                                                </div>

                                                {hasEndpoints ? (
                                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                                                                        Nome
                                                                    </th>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                                                                        Tipo
                                                                    </th>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                                                                        Descrição
                                                                    </th>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                                                                        Unidade
                                                                    </th>
                                                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">
                                                                        Ações
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {controller.endpoints!.map((endpoint) => (
                                                                    <tr key={endpoint.id} className="hover:bg-gray-50">
                                                                        <td className="px-3 py-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <CircleDot className="w-3 h-3 text-gray-400" />
                                                                                <span className="font-medium text-gray-900">
                                                                                    {endpoint.name}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                                                {endpoint.type}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-600">
                                                                            {endpoint.description || '-'}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-gray-600">
                                                                            {endpoint.unit || '-'}
                                                                        </td>
                                                                        <td className="px-3 py-2">
                                                                            <div className="flex items-center justify-end gap-1">
                                                                                <button
                                                                                    onClick={() => onEditEndpoint(controller.id, endpoint)}
                                                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                                                    title="Editar endpoint"
                                                                                >
                                                                                    <Edit className="w-3 h-3" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => onDeleteEndpoint(controller.id, endpoint.id)}
                                                                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                                                                    title="Remover endpoint"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                                        <CircleDot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">
                                                            Nenhum endpoint configurado
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Clique em "Adicionar Endpoint" para começar
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        );
                    })}
                </tbody>
            </table>

            {/* Empty State */}
            {controllers.length === 0 && (
                <div className="text-center py-12">
                    <Network className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Nenhum controlador encontrado</p>
                    <p className="text-sm text-gray-500 mt-1">Adicione um controlador para começar</p>
                </div>
            )}
        </div>
    );
}
