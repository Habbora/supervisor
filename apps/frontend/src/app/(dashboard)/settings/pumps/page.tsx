'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Wind,
    Search,
    Plus,
    Edit,
    Trash2,
    Power,
    AlertTriangle
} from 'lucide-react';

interface Pump {
    id: string;
    name: string;
    type: 'elevatoria' | 'pluvial' | 'esgoto';
    location: string;
    description?: string;
}

export default function PumpsConfigPage() {
    const [pumps, setPumps] = useState<Pump[]>([
        {
            id: '1',
            name: 'Bomba Elevatória 1',
            type: 'elevatoria',
            location: 'Subsolo - Sala de Máquinas',
            description: 'Bomba principal para abastecimento superior'
        },
        {
            id: '2',
            name: 'Bomba Elevatória 2',
            type: 'elevatoria',
            location: 'Subsolo - Sala de Máquinas',
            description: 'Bomba de backup'
        },
        {
            id: '3',
            name: 'Bomba Pluvial',
            type: 'pluvial',
            location: 'Subsolo Norte',
            description: 'Recalque de água pluvial'
        },
        {
            id: '4',
            name: 'Bomba Esgoto Principal',
            type: 'esgoto',
            location: 'Subsolo Sul',
            description: 'Esgotamento sanitário principal'
        },
        {
            id: '5',
            name: 'Bomba Esgoto Secundária',
            type: 'esgoto',
            location: 'Subsolo Sul',
            description: 'Bomba de backup esgoto'
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'elevatoria' | 'pluvial' | 'esgoto'>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingPump, setEditingPump] = useState<Pump | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Pump>>({
        name: '',
        type: 'elevatoria',
        location: '',
        description: ''
    });

    // Filtrar bombas
    const filteredPumps = useMemo(() => {
        let filtered = pumps;

        // Filtro por tipo
        if (filterType !== 'all') {
            filtered = filtered.filter(p => p.type === filterType);
        }

        // Busca por texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.location.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [pumps, filterType, searchQuery]);

    // Estatísticas
    const stats = useMemo(() => {
        return {
            total: pumps.length,
            elevatoria: pumps.filter(p => p.type === 'elevatoria').length,
            pluvial: pumps.filter(p => p.type === 'pluvial').length,
            esgoto: pumps.filter(p => p.type === 'esgoto').length
        };
    }, [pumps]);

    const handleOpenDialog = (pump?: Pump) => {
        if (pump) {
            setEditingPump(pump);
            setFormData(pump);
        } else {
            setEditingPump(null);
            setFormData({
                name: '',
                type: 'elevatoria',
                location: '',
                description: ''
            });
        }
        setIsAddDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsAddDialogOpen(false);
        setEditingPump(null);
        setFormData({
            name: '',
            type: 'elevatoria',
            location: '',
            description: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPump) {
            // Editar existente
            setPumps(pumps.map(p =>
                p.id === editingPump.id ? { ...p, ...formData } as Pump : p
            ));
        } else {
            // Adicionar novo
            const newPump: Pump = {
                id: Date.now().toString(),
                name: formData.name || '',
                type: formData.type || 'elevatoria',
                location: formData.location || '',
                description: formData.description
            };
            setPumps([...pumps, newPump]);
        }

        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja realmente excluir esta bomba?')) {
            setPumps(pumps.filter(p => p.id !== id));
        }
    };

    const getPumpTypeColor = (type: string) => {
        switch (type) {
            case 'elevatoria': return 'from-blue-500 to-cyan-500';
            case 'pluvial': return 'from-purple-500 to-pink-500';
            case 'esgoto': return 'from-amber-500 to-orange-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const getPumpTypeLabel = (type: string) => {
        switch (type) {
            case 'elevatoria': return 'Elevatória';
            case 'pluvial': return 'Pluvial';
            case 'esgoto': return 'Esgoto';
            default: return 'Outro';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/30">
                            <Wind className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Bombas Hidráulicas</h1>
                            <p className="text-gray-600">Configure e gerencie as bombas do sistema</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Bombas</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Wind className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Elevatórias</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.elevatoria}</p>
                                </div>
                                <Power className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Pluviais</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.pluvial}</p>
                                </div>
                                <Power className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-amber-700">Esgoto</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.esgoto}</p>
                                </div>
                                <Power className="w-8 h-8 text-amber-500" />
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
                                placeholder="Buscar bombas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                            />
                        </div>

                        {/* Filters and Actions */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Tipo */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                            >
                                <option value="all">Todos os Tipos</option>
                                <option value="elevatoria">Elevatórias</option>
                                <option value="pluvial">Pluviais</option>
                                <option value="esgoto">Esgoto</option>
                            </select>

                            {/* Add Button */}
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md h-[42px] px-4"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Bomba
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredPumps.length === 0 && (
                    <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                        <Wind className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || filterType !== 'all' ? 'Nenhuma bomba encontrada' : 'Nenhuma bomba cadastrada'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterType !== 'all' ? 'Tente ajustar os filtros de busca.' : 'Adicione bombas para começar o monitoramento.'}
                        </p>
                        {!searchQuery && filterType === 'all' && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeira Bomba
                            </Button>
                        )}
                    </div>
                )}

                {/* Pumps Grid */}
                {filteredPumps.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPumps.map((pump) => (
                            <div
                                key={pump.id}
                                className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getPumpTypeColor(pump.type)} flex items-center justify-center shadow-lg`}>
                                            <Power className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg truncate">{pump.name}</h3>
                                            <p className="text-xs text-gray-500 truncate">{pump.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tipo Badge */}
                                <div className="mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                        pump.type === 'elevatoria' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                        pump.type === 'pluvial' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                        'bg-amber-100 text-amber-700 border-amber-300'
                                    }`}>
                                        {getPumpTypeLabel(pump.type)}
                                    </span>
                                </div>

                                {/* Descrição */}
                                {pump.description && (
                                    <p className="text-sm text-gray-600 mb-4">{pump.description}</p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <Button
                                        onClick={() => handleOpenDialog(pump)}
                                        variant="outline"
                                        className="flex-1 border-2 border-gray-300 hover:border-cyan-500 hover:bg-cyan-50"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(pump.id)}
                                        variant="outline"
                                        className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Deletar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                {filteredPumps.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredPumps.length} {searchQuery || filterType !== 'all' ? `de ${pumps.length}` : ''} bomba(s)
                    </div>
                )}

            </div>

            {/* Dialog Add/Edit */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPump ? 'Editar Bomba' : 'Nova Bomba'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome da Bomba *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Bomba Elevatória 1"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Bomba *
                            </label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                            >
                                <option value="elevatoria">Elevatória (Água Limpa)</option>
                                <option value="pluvial">Pluvial (Água de Chuva)</option>
                                <option value="esgoto">Esgoto (Esgotamento Sanitário)</option>
                            </select>
                        </div>

                        {/* Localização */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Localização *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Subsolo - Sala de Máquinas"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Informações adicionais sobre a bomba..."
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                onClick={handleCloseDialog}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                            >
                                {editingPump ? 'Salvar Alterações' : 'Adicionar Bomba'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
