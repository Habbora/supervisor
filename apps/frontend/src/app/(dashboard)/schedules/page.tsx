'use client';

import { useState, useMemo } from 'react';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { ScheduleCard } from '@/components/schedules/ScheduleCard';
import { ScheduleForm } from '@/components/schedules/ScheduleForm';
import { Calendar, Search, Plus, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CreateScheduleDto, Schedule } from '@/types/schedule';

export default function SchedulesPage() {
    const {
        schedules,
        isLoading,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        toggleSchedule,
        executeSchedule,
    } = useSchedules();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();

    // Filtrar schedules
    const filteredSchedules = useMemo(() => {
        let filtered = schedules;

        // Filtro de status
        if (filterStatus === 'active') {
            filtered = filtered.filter(s => s.isActive);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(s => !s.isActive);
        }

        // Busca por nome
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.id.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [schedules, filterStatus, searchQuery]);

    // Estatísticas
    const stats = useMemo(() => {
        const total = schedules.length;
        const active = schedules.filter(s => s.isActive).length;
        const inactive = total - active;

        const byType = {
            once: schedules.filter(s => s.recurrenceType === 'once').length,
            daily: schedules.filter(s => s.recurrenceType === 'daily').length,
            weekly: schedules.filter(s => s.recurrenceType === 'weekly').length,
        };

        return { total, active, inactive, byType };
    }, [schedules]);

    // Handlers
    const handleCreate = async (data: CreateScheduleDto) => {
        const result = await createSchedule(data);
        if (result) {
            setShowForm(false);
        }
    };

    const handleEdit = (id: string) => {
        const schedule = schedules.find(s => s.id === id);
        if (schedule) {
            setEditingSchedule(schedule);
            setShowForm(true);
        }
    };

    const handleUpdate = async (data: CreateScheduleDto) => {
        if (!editingSchedule) return;

        const result = await updateSchedule(editingSchedule.id, data);
        if (result) {
            setShowForm(false);
            setEditingSchedule(undefined);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja deletar este agendamento?')) {
            await deleteSchedule(id);
        }
    };

    const handleToggle = async (id: string) => {
        await toggleSchedule(id);
    };

    const handleExecute = async (id: string) => {
        const result = await executeSchedule(id);
        if (result) {
            const successCount = result.stats.executed;
            const failedCount = result.stats.failed;
            alert(`Execução concluída!\n✅ ${successCount} ação(ões) executada(s)\n❌ ${failedCount} falha(s)`);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingSchedule(undefined);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Calendar className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
                            <p className="text-gray-600">Gerencie seus agendamentos de automação</p>
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
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Ativos</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Inativos</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                                </div>
                                <XCircle className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Recorrentes</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.byType.daily + stats.byType.weekly}
                                    </p>
                                </div>
                                <Zap className="w-8 h-8 text-blue-500" />
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
                                placeholder="Buscar agendamento..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                        </div>

                        {/* Filtros e Ações */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Status */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="all">Todos</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                            </select>

                            {/* Botão Novo */}
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-[42px] px-4 border-2 border-transparent my-auto"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Agendamento
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Carregando agendamentos...</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredSchedules.length === 0 && (
                    <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Nenhum agendamento encontrado'
                                : 'Nenhum agendamento criado'
                            }
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Crie seu primeiro agendamento para automatizar ações em seus dispositivos.'
                            }
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeiro Agendamento
                            </Button>
                        )}
                    </div>
                )}

                {/* Schedules Grid */}
                {!isLoading && filteredSchedules.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSchedules.map((schedule) => (
                            <ScheduleCard
                                key={schedule.id}
                                schedule={schedule}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onExecute={handleExecute}
                            />
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                {!isLoading && filteredSchedules.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredSchedules.length} {searchQuery || filterStatus !== 'all' ? `de ${schedules.length}` : ''} agendamento(s)
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <ScheduleForm
                    schedule={editingSchedule}
                    onSubmit={editingSchedule ? handleUpdate : handleCreate}
                    onCancel={handleCancelForm}
                />
            )}
        </div>
    );
}
