"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { ControllerType, CreateControllerDTO, Endpoint } from "@/features/controllers/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Network,
    Search,
    Plus,
    TrendingUp,
    Server,
    Wifi,
    WifiOff,
} from "lucide-react";
import { FormAddController } from "@/components/forms/form-create-controller";
import PopupShowComponent from "@/components/popup-show";
import { ControllersTable } from "./ControllersTable";

interface ControllersClientPageProps {
    controllers: ControllerType[];
}

export default function ControllersPage({ controllers }: ControllersClientPageProps) {
    const router = useRouter();
    const { createController, updateController, deleteController, getEndpoints, createEndpoint, updateEndpoint, deleteEndpoint } = useControllers();

    // Estados de busca e filtro
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

    // Estados dos diálogos
    const [isDialogOpen, setIsDialogOpen] = useState<'' | 'addController'>('');
    const [selectedController, setSelectedController] = useState<ControllerType | null>(null);

    // Popup
    const [popupMessage, setPopupMessage] = useState<string>('');
    const [isPopupError, setIsPopupError] = useState<boolean>(false);

    const showPopup = (message: string, timeout: number = 3000, isError: boolean = false) => {
        setIsPopupError(isError);
        setPopupMessage(message);
        setTimeout(() => setPopupMessage(''), timeout);
    }

    // Filtrar controladores
    const filteredControllers = useMemo(() => {
        let filtered = controllers;

        // Filtro de status
        if (filterStatus === 'online') {
            filtered = filtered.filter(c => c.status.isConnected);
        } else if (filterStatus === 'offline') {
            filtered = filtered.filter(c => !c.status.isConnected);
        }

        // Busca por nome ou config
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c => {
                const matchesName = c.name.toLowerCase().includes(query);
                const matchesId = c.id.toLowerCase().includes(query);

                let matchesConfig = false;
                if (c.configs && typeof c.configs === 'object') {
                    const configStr = JSON.stringify(c.configs).toLowerCase();
                    matchesConfig = configStr.includes(query);
                }

                return matchesName || matchesId || matchesConfig;
            });
        }

        return filtered;
    }, [controllers, filterStatus, searchQuery]);

    // Estatísticas
    const stats = useMemo(() => {
        const total = controllers.length;
        const online = controllers.filter(c => c.isConnected).length;
        const offline = total - online;
        const successRate = total > 0 ? Math.round((online / total) * 100) : 0;

        return { total, online, offline, successRate };
    }, [controllers]);

    // Handlers
    const handleAddController = () => {
        setSelectedController(null);
        setIsDialogOpen('addController');
    }

    const handleEditController = (controller: ControllerType) => {
        // Redireciona para a página de edição dedicada
        router.push(`/settings/controllers/${controller.id}`);
    }

    const handleDeleteController = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este controlador? Todos os endpoints serão removidos também.')) {
            const success = await deleteController(id);
            if (success) {
                showPopup('Controlador removido com sucesso!');
            } else {
                showPopup('Erro ao remover controlador', 3000, true);
            }
        }
    }

    const handleSubmitController = async (data: CreateControllerDTO) => {
        // Criar novo controlador
        const created = await createController(data);
        if (created) {
            showPopup('Controlador criado com sucesso!');
            setIsDialogOpen('');
            // Redireciona para a página de edição para configurar
            router.push(`/settings/controllers/${created.id}`);
        } else {
            showPopup('Erro ao criar controlador', 3000, true);
        }
    }

    const handleAddEndpoint = (controllerId: string) => {
        // Redireciona para página de edição do controlador
        router.push(`/settings/controllers/${controllerId}`);
    }

    const handleEditEndpoint = (controllerId: string, endpoint: Endpoint) => {
        // Redireciona para página de edição do controlador
        router.push(`/settings/controllers/${controllerId}`);
    }

    const handleDeleteEndpoint = async (controllerId: string, endpointId: string) => {
        if (confirm('Tem certeza que deseja remover este endpoint?')) {
            const success = await deleteEndpoint(controllerId, endpointId);
            if (success) {
                showPopup('Endpoint removido com sucesso!');
            } else {
                showPopup('Erro ao remover endpoint', 3000, true);
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/30">
                            <Network className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Controladores</h1>
                            <p className="text-gray-600">Gerencie os controladores e seus endpoints</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Server className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Online</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.online}</p>
                                </div>
                                <Wifi className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className={`rounded-xl p-4 border-2 shadow-sm ${stats.offline > 0
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${stats.offline > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                                        Offline
                                    </p>
                                    <p className={`text-2xl font-bold ${stats.offline > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {stats.offline}
                                    </p>
                                </div>
                                <WifiOff className={`w-8 h-8 ${stats.offline > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Taxa de Sucesso</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou configuração..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                            />
                        </div>

                        {/* Filtros e Ações */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                            >
                                <option value="all">Todos</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>

                            {/* Botão Novo */}
                            <Button
                                onClick={handleAddController}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md h-[42px] px-4 border-2 border-transparent"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Controlador
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabela de Controladores */}
                <ControllersTable
                    controllers={filteredControllers}
                    onEditController={handleEditController}
                    onDeleteController={handleDeleteController}
                    onAddEndpoint={handleAddEndpoint}
                    onEditEndpoint={handleEditEndpoint}
                    onDeleteEndpoint={handleDeleteEndpoint}
                />

                {/* Footer Info */}
                {filteredControllers.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredControllers.length} {searchQuery || filterStatus !== 'all' ? `de ${controllers.length}` : ''} controlador(es)
                    </div>
                )}

            </div>

            {/* Modal Adicionar Controlador */}
            <Dialog open={isDialogOpen === 'addController'} onOpenChange={() => setIsDialogOpen('')}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Controlador</DialogTitle>
                    </DialogHeader>
                    <FormAddController
                        onServiceSubmit={handleSubmitController}
                    />
                </DialogContent>
            </Dialog>

            <PopupShowComponent
                message={popupMessage}
                isError={isPopupError}
            />
        </div>
    )
}
