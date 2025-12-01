'use client';

import { useState } from 'react';
import type { Schedule } from '@/types/schedule';
import { RECURRENCE_TYPE_LABELS, WEEKDAY_SHORT_NAMES } from '@/types/schedule';
import { Clock, Calendar, Play, Edit, Trash2, Power, PowerOff, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScheduleCardProps {
    schedule: Schedule;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onExecute: (id: string) => void;
}

export function ScheduleCard({ schedule, onToggle, onEdit, onDelete, onExecute }: ScheduleCardProps) {
    const [isExecuting, setIsExecuting] = useState(false);

    const handleExecute = async () => {
        setIsExecuting(true);
        await onExecute(schedule.id);
        setTimeout(() => setIsExecuting(false), 2000);
    };

    // Formata horário para HH:MM
    const formatTime = (hour: number, minute: number) => {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // Calcula tempo até próxima execução
    const getNextExecutionText = () => {
        if (!schedule.nextExecution) return 'Não agendado';
        try {
            return formatDistanceToNow(new Date(schedule.nextExecution), {
                addSuffix: true,
                locale: ptBR
            });
        } catch {
            return 'Data inválida';
        }
    };

    // Badge de recorrência semanal
    const getWeekdayBadges = () => {
        if (schedule.recurrenceType !== 'weekly' || !schedule.recurrenceConfig?.weekdays) {
            return null;
        }

        return (
            <div className="flex flex-wrap gap-1 mt-2">
                {schedule.recurrenceConfig.weekdays.map(day => (
                    <span
                        key={day}
                        className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded"
                    >
                        {WEEKDAY_SHORT_NAMES[day]}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div
            className={`
                relative rounded-xl p-5 border-2 transition-all duration-300 overflow-hidden
                ${schedule.isActive
                    ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300 shadow-md shadow-blue-200/50'
                    : 'bg-white border-gray-200 opacity-75'
                }
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate" title={schedule.name}>
                            {schedule.name}
                        </h3>
                        {schedule.isActive ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                            <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate cursor-help" title={`ID: ${schedule.id}`}>
                        ID: {schedule.id.substring(0, 8)}...
                    </p>
                </div>
            </div>

            {/* Horário e Recorrência */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">
                        {formatTime(schedule.time.hour, schedule.time.minute)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className={`
                        px-2 py-1 rounded-lg text-sm font-medium
                        ${schedule.recurrenceType === 'once' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${schedule.recurrenceType === 'daily' ? 'bg-green-100 text-green-700' : ''}
                        ${schedule.recurrenceType === 'weekly' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                        {RECURRENCE_TYPE_LABELS[schedule.recurrenceType]}
                    </span>
                </div>

                {getWeekdayBadges()}
            </div>

            {/* Próxima Execução */}
            {schedule.isActive && (
                <div className="mb-4 p-2 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-600">Próxima execução:</p>
                    <p className="text-sm font-medium text-gray-900">{getNextExecutionText()}</p>
                </div>
            )}

            {/* Ações */}
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">
                    Ações ({schedule.actions.length})
                </p>
                <div className="space-y-1 mb-3 max-h-20 overflow-y-auto">
                    {schedule.actions.slice(0, 3).map((action, idx) => (
                        <div key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                            <span className="truncate">{action.action} (valor: {action.value})</span>
                        </div>
                    ))}
                    {schedule.actions.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                            +{schedule.actions.length - 3} ação(ões)
                        </p>
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={() => onToggle(schedule.id)}
                        variant="outline"
                        size="sm"
                        className={`
                            ${schedule.isActive
                                ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }
                        `}
                    >
                        {schedule.isActive ? (
                            <>
                                <PowerOff className="w-3 h-3 mr-1" />
                                Desativar
                            </>
                        ) : (
                            <>
                                <Power className="w-3 h-3 mr-1" />
                                Ativar
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleExecute}
                        disabled={isExecuting || !schedule.isActive}
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        <Play className="w-3 h-3 mr-1" />
                        {isExecuting ? 'Executando...' : 'Executar'}
                    </Button>

                    <Button
                        onClick={() => onEdit(schedule.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50"
                    >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                    </Button>

                    <Button
                        onClick={() => onDelete(schedule.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Deletar
                    </Button>
                </div>
            </div>
        </div>
    );
}
