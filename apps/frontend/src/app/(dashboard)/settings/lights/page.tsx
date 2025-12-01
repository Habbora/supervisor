"use client";

import { useState, useMemo, useEffect } from "react";
import { useLights, CreateLightDTO } from "@/features/lights/hooks/useLights";
import { useControllers } from "@/features/controllers/hooks/useControllers";
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
    Edit,
    Trash2,
    Server,
    AlertCircle,
    CheckCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SettingsLightsPage() {
    const { lights, isLightsLoaded, createLight, updateLight, deleteLight } = useLights();
    const { controllers, isControllersLoaded } = useControllers();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLight, setEditingLight] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    // Form state
    const [formData, setFormData] = useState<CreateLightDTO>({
        name: '',
        controllerId: '',
        endpointName: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Filtrar lâmpadas
    const filteredLights = useMemo(() => {
        let filtered = [...lights];

        // Filtro por status
        if (filterStatus === 'online') {
            filtered = filtered.filter((light) => light.isOnline !== false);
        } else if (filterStatus === 'offline') {
            filtered = filtered.filter((light) => light.isOnline === false);
        }

        // Busca por nome
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((light) =>
                light.name.toLowerCase().includes(query) ||
                light.id.toLowerCase().includes(query) ||
                light.endpointName.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [lights, filterStatus, searchQuery]);

    // Estatísticas
    const stats = useMemo(() => {
        const total = lights.length;
        const online = lights.filter((light) => light.isOnline !== false).length;
        const offline = total - online;

        return { total, online, offline };
    }, [lights]);

    // Validar formulário
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Nome é obrigatório';
        } else if (formData.name.trim().length < 3) {
            errors.name = 'Nome deve ter no mínimo 3 caracteres';
        }

        if (!formData.controllerId) {
            errors.controllerId = 'Controlador é obrigatório';
        }

        if (!formData.endpointName.trim()) {
            errors.endpointName = 'Nome do endpoint é obrigatório';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    function handleOpenDialog(light?: any) {
        setError('');
        setFormErrors({});

        if (light) {
            setEditingLight(light);
            setFormData({
                name: light.name,
                controllerId: light.controllerId,
                endpointName: light.endpointName
            });
        } else {
            setEditingLight(null);
            setFormData({
                name: '',
                controllerId: controllers.length > 0 ? controllers[0].id : '',
                endpointName: ''
            });
        }
        setIsDialogOpen(true);
    }

    function handleCloseDialog() {
        setIsDialogOpen(false);
        setEditingLight(null);
        setError('');
        setFormErrors({});
        setFormData({
            name: '',
            controllerId: '',
            endpointName: ''
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            if (editingLight) {
                await updateLight(editingLight.id, formData);
            } else {
                await createLight(formData);
            }
            handleCloseDialog();
        } catch (err: any) {
            console.error('Erro ao salvar lâmpada:', err);
            setError(err.message || 'Erro ao salvar lâmpada. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(light: any) {
        if (!confirm(`Deseja realmente excluir a lâmpada "${light.name}"?`)) {
            return;
        }

        try {
            await deleteLight(light.id);
        } catch (err: any) {
            console.error('Erro ao deletar lâmpada:', err);
            alert('Erro ao deletar lâmpada. Tente novamente.');
        }
    }

    const updateField = (field: keyof CreateLightDTO, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo ao editar
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Obter nome do controlador
    const getControllerName = (controllerId: string) => {
        const controller = controllers.find(c => c.id === controllerId);
        return controller?.name || controllerId;
    };

    // Loading state
    if (!isLightsLoaded || !isControllersLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando lâmpadas...</p>
                </div>
            </div>
        );
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
                            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Lâmpadas</h1>
                            <p className="text-gray-600">Configure e gerencie as lâmpadas do sistema</p>
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
                                placeholder="Buscar por nome, ID ou endpoint..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
                            />
                        </div>

                        {/* Filtros e Ações */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                            >
                                <option value="all">Todos</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>

                            {/* Botão Novo */}
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md h-[42px] px-4 border-2 border-transparent my-auto"
                                disabled={controllers.length === 0}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Lâmpada
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Warning se não há controladores */}
                {controllers.length === 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-1">Nenhum controlador disponível</h3>
                                <p className="text-sm text-yellow-700">
                                    Você precisa cadastrar pelo menos um controlador antes de adicionar lâmpadas.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredLights.length === 0 && (
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
                        {!searchQuery && filterStatus === 'all' && controllers.length > 0 && (
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

                {/* Lights Grid */}
                {filteredLights.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLights.map((light) => {
                            const isOnline = light.isOnline !== false;

                            return (
                                <div
                                    key={light.id}
                                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all group"
                                >
                                    {/* Header do Card */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg ${
                                                isOnline
                                                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                            }`}>
                                                <Lightbulb className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                    {light.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{light.id}</p>
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
                                            <Server className="w-4 h-4 text-gray-400" />
                                            <span className="truncate">{getControllerName(light.controllerId)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-gray-400" />
                                            <span className="font-mono text-xs truncate">{light.endpointName}</span>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={() => handleOpenDialog(light)}
                                            variant="outline"
                                            className="flex-1 border-2 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(light)}
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
                {filteredLights.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredLights.length} {searchQuery || filterStatus !== 'all' ? `de ${stats.total}` : ''} lâmpada(s)
                    </div>
                )}

            </div>

            {/* Dialog Add/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                            {editingLight ? 'Editar Lâmpada' : 'Nova Lâmpada'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Nome */}
                        <div>
                            <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4" />
                                Nome da Lâmpada *
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Ex: Lâmpada Sala 1"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className={`h-11 border-2 ${formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-yellow-500'}`}
                            />
                            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>

                        {/* Controlador */}
                        <div>
                            <Label htmlFor="controllerId" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                                <Server className="w-4 h-4" />
                                Controlador *
                            </Label>
                            <select
                                id="controllerId"
                                value={formData.controllerId}
                                onChange={(e) => updateField('controllerId', e.target.value)}
                                className={`w-full h-11 px-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                                    formErrors.controllerId
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-200'
                                }`}
                            >
                                <option value="">Selecione um controlador</option>
                                {controllers.map((controller) => (
                                    <option key={controller.id} value={controller.id}>
                                        {controller.name} ({controller.host}:{controller.port})
                                    </option>
                                ))}
                            </select>
                            {formErrors.controllerId && <p className="mt-1 text-sm text-red-600">{formErrors.controllerId}</p>}
                        </div>

                        {/* Endpoint Name */}
                        <div>
                            <Label htmlFor="endpointName" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4" />
                                Nome do Endpoint *
                            </Label>
                            <Input
                                id="endpointName"
                                type="text"
                                placeholder="Ex: LAMP_01, LIGHT_ZONE_A"
                                value={formData.endpointName}
                                onChange={(e) => updateField('endpointName', e.target.value)}
                                className={`h-11 border-2 font-mono text-sm ${formErrors.endpointName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-yellow-500'}`}
                            />
                            {formErrors.endpointName && <p className="mt-1 text-sm text-red-600">{formErrors.endpointName}</p>}
                            <p className="mt-1 text-xs text-gray-500">
                                Identificador do endpoint no controlador Modbus
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-semibold mb-1">Informação importante:</p>
                                    <p>
                                        O endpoint deve corresponder ao nome configurado no controlador Modbus.
                                        Certifique-se de que o controlador está online e acessível.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                            <Button
                                type="button"
                                onClick={handleCloseDialog}
                                variant="outline"
                                className="flex-1 border-2"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : editingLight ? 'Salvar Alterações' : 'Criar Lâmpada'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
