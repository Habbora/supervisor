"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "@/features/dashboard/provider/dashboardProvider";
import { DeviceType } from "@/features/device/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Plus,
    Lightbulb,
    Wifi,
    WifiOff,
    Settings,
    Edit,
    Trash2
} from "lucide-react";

export default function DevicesPage() {
    const { devices, refreshDashboard } = useDashboard();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'light' as 'light' | 'pump' | 'level'
    });

    // Filtrar dispositivos (apenas iluminação)
    const filteredDevices = useMemo(() => {
        // Filtra apenas dispositivos de iluminação
        let filtered = devices.filter((d: DeviceType) => d.type === 'light');

        // Filtro por status
        if (filterStatus === 'online') {
            filtered = filtered.filter((d: DeviceType) => d.isOnline !== false);
        } else if (filterStatus === 'offline') {
            filtered = filtered.filter((d: DeviceType) => d.isOnline === false);
        }

        // Busca por nome
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((d: DeviceType) =>
                d.name.toLowerCase().includes(query) ||
                d.id.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [devices, filterStatus, searchQuery]);

    // Estatísticas (apenas iluminação)
    const stats = useMemo(() => {
        const lights = devices.filter((d: DeviceType) => d.type === 'light');
        const total = lights.length;
        const online = lights.filter((d: DeviceType) => d.isOnline !== false).length;
        const offline = total - online;

        return { total, online, offline };
    }, [devices]);

    function handleOpenDialog(device?: DeviceType) {
        if (device) {
            setEditingDevice(device);
            setFormData({
                name: device.name,
                type: device.type as 'light' | 'pump' | 'level'
            });
        } else {
            setEditingDevice(null);
            setFormData({
                name: '',
                type: 'light'
            });
        }
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingDevice(null);
        setFormData({
            name: '',
            type: 'light'
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingDevice
                ? `/api/devices/${editingDevice.id}`
                : '/api/devices';

            const method = editingDevice ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar dispositivo');
            }

            await refreshDashboard();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar dispositivo:', error);
            alert('Erro ao salvar dispositivo. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(device: DeviceType) {
        if (!confirm(`Deseja realmente excluir o dispositivo "${device.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/devices/${device.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Falha ao deletar dispositivo');
            }

            await refreshDashboard();
        } catch (error) {
            console.error('Erro ao deletar dispositivo:', error);
            alert('Erro ao deletar dispositivo. Tente novamente.');
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg shadow-yellow-500/30">
                            <Lightbulb className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Iluminação</h1>
                            <p className="text-gray-600">Gerencie os dispositivos de iluminação do sistema</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-700">Total de Lâmpadas</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.total}</p>
                                </div>
                                <Lightbulb className="w-8 h-8 text-yellow-500" />
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

                        <div className={`rounded-xl p-4 border-2 shadow-sm ${
                            stats.offline > 0
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
                                placeholder="Buscar por nome ou ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>

                        {/* Filtros e Ações */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            >
                                <option value="all">Todos</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>

                            {/* Botão Novo */}
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md h-[42px] px-4 border-2 border-transparent my-auto"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Lâmpada
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredDevices.length === 0 && (
                    <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                        <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Nenhuma lâmpada encontrada'
                                : 'Nenhuma lâmpada cadastrada'
                            }
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Adicione lâmpadas para começar a gerenciar a iluminação.'}
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeira Lâmpada
                            </Button>
                        )}
                    </div>
                )}

                {/* Devices Grid */}
                {filteredDevices.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDevices.map((device: DeviceType) => {
                            const isOnline = device.isOnline !== false;

                            return (
                                <div
                                    key={device.id}
                                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all group"
                                >
                                    {/* Header do Card */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                                                <Lightbulb className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                    {device.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{device.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
                                            isOnline
                                                ? 'bg-green-100 text-green-700 border-green-300'
                                                : 'bg-red-100 text-red-700 border-red-300'
                                        }`}>
                                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                            {isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>

                                    {/* Informações */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Settings className="w-4 h-4" />
                                            <span className="capitalize">{device.type}</span>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={() => handleOpenDialog(device)}
                                            variant="outline"
                                            className="flex-1 border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(device)}
                                            variant="outline"
                                            className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Deletar
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Info */}
                {filteredDevices.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredDevices.length} {searchQuery || filterStatus !== 'all' ? `de ${stats.total}` : ''} lâmpada(s)
                    </div>
                )}

            </div>

            {/* Dialog Add/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                            {editingDevice ? 'Editar Lâmpada' : 'Nova Lâmpada'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome da Lâmpada *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Lâmpada Sala 1"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        {/* Info sobre configurações adicionais */}
                        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700">
                                <strong>Nota:</strong> As configurações detalhadas da lâmpada (controlador, endpoints, parâmetros Modbus, etc.)
                                serão configuradas após a criação através da página de detalhes.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={handleCloseDialog}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : editingDevice ? 'Salvar Alterações' : 'Criar Lâmpada'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}