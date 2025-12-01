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
    Droplet,
    Search,
    Plus,
    Edit,
    Trash2,
    Gauge,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface WaterTank {
    id: string;
    name: string;
    capacity: number; // em litros
    area: number; // área do reservatório em m²
    maxWaterHeight: number; // altura máxima de água em metros
    minLevel: number; // nível mínimo de alerta (%)
    maxLevel: number; // nível máximo (%)
    location: string;
    description?: string;
}

export default function WaterTanksConfigPage() {
    const [tanks, setTanks] = useState<WaterTank[]>([
        {
            id: '1',
            name: 'Caixa Principal',
            capacity: 10000,
            area: 20,
            maxWaterHeight: 2.5,
            minLevel: 20,
            maxLevel: 95,
            location: 'Subsolo',
            description: 'Caixa d\'água principal do edifício'
        },
        {
            id: '2',
            name: 'Reservatório Superior',
            capacity: 5000,
            area: 15,
            maxWaterHeight: 2.0,
            minLevel: 15,
            maxLevel: 95,
            location: 'Cobertura',
            description: 'Reservatório elevado'
        },
        {
            id: '3',
            name: 'Cisterna Pluvial',
            capacity: 15000,
            area: 30,
            maxWaterHeight: 3.0,
            minLevel: 10,
            maxLevel: 95,
            location: 'Subsolo Norte',
            description: 'Captação de água da chuva'
        },
        {
            id: '4',
            name: 'Reserva Técnica',
            capacity: 3000,
            area: 10,
            maxWaterHeight: 1.5,
            minLevel: 20,
            maxLevel: 95,
            location: 'Subsolo Sul',
            description: 'Reservatório para sistemas críticos'
        }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingTank, setEditingTank] = useState<WaterTank | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<WaterTank>>({
        name: '',
        capacity: 0,
        area: 10,
        maxWaterHeight: 2.0,
        minLevel: 20,
        maxLevel: 95,
        location: '',
        description: ''
    });

    // Calcular capacidade automaticamente baseado na área e altura
    const calculateCapacity = (area: number, height: number) => {
        return Math.round(area * height * 1000); // m² * m * 1000 = litros
    };

    // Filtrar reservatórios
    const filteredTanks = useMemo(() => {
        if (!searchQuery.trim()) return tanks;

        const query = searchQuery.toLowerCase();
        return tanks.filter(tank =>
            tank.name.toLowerCase().includes(query) ||
            tank.location.toLowerCase().includes(query) ||
            tank.description?.toLowerCase().includes(query)
        );
    }, [tanks, searchQuery]);

    const handleOpenDialog = (tank?: WaterTank) => {
        if (tank) {
            setEditingTank(tank);
            setFormData(tank);
        } else {
            setEditingTank(null);
            const defaultArea = 10;
            const defaultHeight = 2.0;
            setFormData({
                name: '',
                capacity: calculateCapacity(defaultArea, defaultHeight),
                area: defaultArea,
                maxWaterHeight: defaultHeight,
                minLevel: 20,
                maxLevel: 95,
                location: '',
                description: ''
            });
        }
        setIsAddDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsAddDialogOpen(false);
        setEditingTank(null);
        const defaultArea = 10;
        const defaultHeight = 2.0;
        setFormData({
            name: '',
            capacity: calculateCapacity(defaultArea, defaultHeight),
            area: defaultArea,
            maxWaterHeight: defaultHeight,
            minLevel: 20,
            maxLevel: 95,
            location: '',
            description: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const area = formData.area || 10;
        const maxWaterHeight = formData.maxWaterHeight || 2.0;
        const calculatedCapacity = calculateCapacity(area, maxWaterHeight);

        if (editingTank) {
            // Editar existente
            setTanks(tanks.map(t =>
                t.id === editingTank.id ? {
                    ...t,
                    ...formData,
                    capacity: calculatedCapacity
                } as WaterTank : t
            ));
        } else {
            // Adicionar novo
            const newTank: WaterTank = {
                id: Date.now().toString(),
                name: formData.name || '',
                capacity: calculatedCapacity,
                area: area,
                maxWaterHeight: maxWaterHeight,
                minLevel: formData.minLevel || 20,
                maxLevel: formData.maxLevel || 95,
                location: formData.location || '',
                description: formData.description
            };
            setTanks([...tanks, newTank]);
        }

        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja realmente excluir este reservatório?')) {
            setTanks(tanks.filter(t => t.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Droplet className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reservatórios de Água</h1>
                            <p className="text-gray-600">Configure e gerencie os reservatórios do sistema</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Reservatórios</p>
                                    <p className="text-2xl font-bold text-gray-900">{tanks.length}</p>
                                </div>
                                <Droplet className="w-8 h-8 text-blue-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Capacidade Total</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(tanks.reduce((sum, t) => sum + t.capacity, 0) / 1000).toFixed(0)}m³
                                    </p>
                                </div>
                                <Gauge className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Maior Reservatório</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {tanks.length > 0 ? (Math.max(...tanks.map(t => t.capacity)) / 1000).toFixed(0) : 0}m³
                                    </p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
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
                                placeholder="Buscar reservatórios..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        {/* Add Button */}
                        <Button
                            onClick={() => handleOpenDialog()}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md h-[42px] px-4"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Reservatório
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                {filteredTanks.length === 0 && (
                    <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                        <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'Nenhum reservatório encontrado' : 'Nenhum reservatório cadastrado'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery ? 'Tente ajustar os filtros de busca.' : 'Adicione reservatórios para começar o monitoramento.'}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => handleOpenDialog()}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeiro Reservatório
                            </Button>
                        )}
                    </div>
                )}

                {/* Tanks Grid */}
                {filteredTanks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTanks.map((tank) => (
                            <div
                                key={tank.id}
                                className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                            <Droplet className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{tank.name}</h3>
                                            <p className="text-xs text-gray-500">{tank.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Descrição */}
                                {tank.description && (
                                    <p className="text-sm text-gray-600 mb-4">{tank.description}</p>
                                )}

                                {/* Métricas */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-700">Capacidade</span>
                                        <span className="text-sm font-bold text-blue-600">
                                            {(tank.capacity / 1000).toFixed(1)}m³
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                                            <span className="text-xs text-cyan-700 mb-1">Área</span>
                                            <span className="text-lg font-bold text-cyan-600">{tank.area}m²</span>
                                        </div>

                                        <div className="flex flex-col p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                                            <span className="text-xs text-indigo-700 mb-1">Altura Máx.</span>
                                            <span className="text-lg font-bold text-indigo-600">{tank.maxWaterHeight}m</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <span className="text-xs text-yellow-700 mb-1">Nível Mínimo</span>
                                            <span className="text-lg font-bold text-yellow-600">{tank.minLevel}%</span>
                                        </div>

                                        <div className="flex flex-col p-2 bg-green-50 rounded-lg border border-green-200">
                                            <span className="text-xs text-green-700 mb-1">Nível Máximo</span>
                                            <span className="text-lg font-bold text-green-600">{tank.maxLevel}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <Button
                                        onClick={() => handleOpenDialog(tank)}
                                        variant="outline"
                                        className="flex-1 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(tank.id)}
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
                {filteredTanks.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredTanks.length} {searchQuery ? `de ${tanks.length}` : ''} reservatório(s)
                    </div>
                )}

            </div>

            {/* Dialog Add/Edit */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTank ? 'Editar Reservatório' : 'Novo Reservatório'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Reservatório *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Caixa Principal"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
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
                                placeholder="Ex: Subsolo"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Área e Altura */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Área do Reservatório (m²) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.1"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Área da base do reservatório</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Altura Máxima de Água (m) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.1"
                                    step="0.1"
                                    value={formData.maxWaterHeight}
                                    onChange={(e) => setFormData({ ...formData, maxWaterHeight: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Altura máxima da coluna d'água</p>
                            </div>
                        </div>

                        {/* Capacidade Calculada (Informação) */}
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Capacidade Calculada</p>
                                    <p className="text-xs text-blue-600 mt-0.5">
                                        Baseada na área × altura
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {(calculateCapacity(formData.area || 0, formData.maxWaterHeight || 0) / 1000).toFixed(2)}m³
                                    </p>
                                    <p className="text-xs text-blue-500">
                                        {calculateCapacity(formData.area || 0, formData.maxWaterHeight || 0).toLocaleString('pt-BR')} litros
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Níveis */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nível Mínimo (%) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    value={formData.minLevel}
                                    onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Alerta quando atingir</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nível Máximo (%) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    value={formData.maxLevel}
                                    onChange={(e) => setFormData({ ...formData, maxLevel: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Nível de segurança</p>
                            </div>
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
                                placeholder="Informações adicionais sobre o reservatório..."
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            >
                                {editingTank ? 'Salvar Alterações' : 'Adicionar Reservatório'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
