'use client';

import { useState, useEffect } from 'react';
import type { Schedule, CreateScheduleDto, RecurrenceType, ScheduleAction } from '@/types/schedule';
import { WEEKDAY_NAMES, RECURRENCE_TYPE_LABELS } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus, Trash2 } from 'lucide-react';
import { useDevices } from '@/features/device/hooks/useDevices';
import { DeviceType } from '@/features/device/types';

interface ScheduleFormProps {
    schedule?: Schedule;
    onSubmit: (data: CreateScheduleDto) => void;
    onCancel: () => void;
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: ScheduleFormProps) {
    const { devices } = useDevices();
    const isEditing = !!schedule;

    // Form state
    const [name, setName] = useState(schedule?.name || '');
    const [hour, setHour] = useState(schedule?.time.hour ?? 18);
    const [minute, setMinute] = useState(schedule?.time.minute ?? 0);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(schedule?.recurrenceType || 'daily');
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
        schedule?.recurrenceConfig?.weekdays || []
    );
    const [actions, setActions] = useState<ScheduleAction[]>(schedule?.actions || []);

    // Action builder state
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [actionValue, setActionValue] = useState(1);

    // Validação
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Encontra dispositivo selecionado
    const selectedDevice = devices?.find((d: DeviceType) => d.id === selectedDeviceId);

    // Pega ações disponíveis do dispositivo
    const getAvailableActions = () => {
        if (!selectedDevice) return [];
        // Para lights, sabemos que tem setToggle
        if (selectedDevice.type === 'light') {
            return ['setToggle'];
        }
        return ['setToggle', 'setValue']; // Fallback
    };

    const handleAddAction = () => {
        if (!selectedDeviceId || !selectedAction) {
            setErrors({ ...errors, action: 'Selecione um dispositivo e uma ação' });
            return;
        }

        const newAction: ScheduleAction = {
            deviceId: selectedDeviceId,
            action: selectedAction,
            value: actionValue
        };

        setActions([...actions, newAction]);
        setSelectedDeviceId('');
        setSelectedAction('');
        setActionValue(1);
        setErrors({ ...errors, action: '' });
    };

    const handleRemoveAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const toggleWeekday = (day: number) => {
        if (selectedWeekdays.includes(day)) {
            setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
        } else {
            setSelectedWeekdays([...selectedWeekdays, day].sort());
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (hour < 0 || hour > 23) {
            newErrors.hour = 'Hora deve estar entre 0 e 23';
        }

        if (minute < 0 || minute > 59) {
            newErrors.minute = 'Minuto deve estar entre 0 e 59';
        }

        if (recurrenceType === 'weekly' && selectedWeekdays.length === 0) {
            newErrors.weekdays = 'Selecione pelo menos um dia da semana';
        }

        if (actions.length === 0) {
            newErrors.actions = 'Adicione pelo menos uma ação';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const data: CreateScheduleDto = {
            name: name.trim(),
            time: { hour, minute },
            recurrenceType,
            recurrenceConfig: recurrenceType === 'weekly'
                ? { weekdays: selectedWeekdays }
                : undefined,
            actions
        };

        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nome */}
                    <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                            Nome do Agendamento *
                        </Label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Ligar luzes da sala"
                            className={`
                                mt-1 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${errors.name ? 'border-red-500' : 'border-gray-300'}
                            `}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Horário */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hour" className="text-gray-700 font-medium">
                                Hora *
                            </Label>
                            <input
                                id="hour"
                                type="number"
                                min="0"
                                max="23"
                                value={hour}
                                onChange={(e) => setHour(parseInt(e.target.value))}
                                className={`
                                    mt-1 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${errors.hour ? 'border-red-500' : 'border-gray-300'}
                                `}
                            />
                            {errors.hour && <p className="mt-1 text-sm text-red-600">{errors.hour}</p>}
                        </div>

                        <div>
                            <Label htmlFor="minute" className="text-gray-700 font-medium">
                                Minuto *
                            </Label>
                            <input
                                id="minute"
                                type="number"
                                min="0"
                                max="59"
                                value={minute}
                                onChange={(e) => setMinute(parseInt(e.target.value))}
                                className={`
                                    mt-1 w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${errors.minute ? 'border-red-500' : 'border-gray-300'}
                                `}
                            />
                            {errors.minute && <p className="mt-1 text-sm text-red-600">{errors.minute}</p>}
                        </div>
                    </div>

                    {/* Tipo de Recorrência */}
                    <div>
                        <Label className="text-gray-700 font-medium mb-3 block">
                            Tipo de Recorrência *
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['once', 'daily', 'weekly'] as RecurrenceType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setRecurrenceType(type)}
                                    className={`
                                        p-3 rounded-lg border-2 font-medium transition-all
                                        ${recurrenceType === type
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                        }
                                    `}
                                >
                                    {RECURRENCE_TYPE_LABELS[type]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dias da Semana (apenas para weekly) */}
                    {recurrenceType === 'weekly' && (
                        <div>
                            <Label className="text-gray-700 font-medium mb-3 block">
                                Dias da Semana *
                            </Label>
                            <div className="grid grid-cols-7 gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleWeekday(day)}
                                        className={`
                                            p-2 rounded-lg text-sm font-medium transition-all
                                            ${selectedWeekdays.includes(day)
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        {WEEKDAY_NAMES[day].substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            {errors.weekdays && <p className="mt-1 text-sm text-red-600">{errors.weekdays}</p>}
                        </div>
                    )}

                    {/* Action Builder */}
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        <Label className="text-gray-700 font-medium mb-3 block">
                            Adicionar Ações *
                        </Label>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            {/* Dispositivo */}
                            <select
                                value={selectedDeviceId}
                                onChange={(e) => {
                                    setSelectedDeviceId(e.target.value);
                                    setSelectedAction('');
                                }}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione dispositivo</option>
                                {devices?.map((device: DeviceType) => (
                                    <option key={device.id} value={device.id}>
                                        {device.name}
                                    </option>
                                ))}
                            </select>

                            {/* Ação */}
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                disabled={!selectedDeviceId}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Selecione ação</option>
                                {getAvailableActions().map(action => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>

                            {/* Valor */}
                            <input
                                type="number"
                                value={actionValue}
                                onChange={(e) => setActionValue(parseInt(e.target.value))}
                                placeholder="Valor"
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Botão Adicionar */}
                            <Button
                                type="button"
                                onClick={handleAddAction}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>

                        {errors.action && <p className="text-sm text-red-600 mb-2">{errors.action}</p>}

                        {/* Lista de Ações */}
                        {actions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Ações agendadas ({actions.length}):
                                </p>
                                {actions.map((action, idx) => {
                                    const device = devices?.find((d: DeviceType) => d.id === action.deviceId);
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {device?.name || 'Dispositivo desconhecido'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {action.action} (valor: {action.value})
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAction(idx)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {errors.actions && <p className="mt-2 text-sm text-red-600">{errors.actions}</p>}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-2 border-gray-300"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            {isEditing ? 'Salvar Alterações' : 'Criar Agendamento'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
