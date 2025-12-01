"use client";

import { useEffect, useState, useMemo } from "react";
import { useDashboard } from "@/features/dashboard/provider/dashboardProvider";
import { useSchedules } from "@/features/schedules/hooks/useSchedules";
import { DeviceType } from "@/features/device/types";
import {
    Home,
    Zap,
    AlertTriangle,
    CheckCircle,
    Clock,
    Calendar,
    Activity,
    TrendingUp,
    Server,
    Wifi,
    WifiOff,
    Play,
    Lightbulb,
    Droplet,
    Gauge
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function DashboardPage() {
    const { devices, controllers } = useDashboard();
    const { schedules } = useSchedules();

    // Estatísticas gerais
    const stats = useMemo(() => {
        const totalDevices = devices?.length || 0;
        const onlineDevices = devices?.filter((d: DeviceType) => d.isOnline !== false).length || 0;
        const offlineDevices = totalDevices - onlineDevices;

        const totalControllers = controllers?.length || 0;
        const onlineControllers = controllers?.filter((c: any) => c.isConnected).length || 0;

        const totalSchedules = schedules?.length || 0;
        const activeSchedules = schedules?.filter((s: any) => s.isActive).length || 0;

        // Próximos agendamentos (hoje)
        const today = new Date();
        const todaySchedules = schedules?.filter((s: any) => {
            if (!s.isActive || !s.nextExecution) return false;
            const nextExec = new Date(s.nextExecution);
            return nextExec.toDateString() === today.toDateString();
        }).length || 0;

        return {
            totalDevices,
            onlineDevices,
            offlineDevices,
            totalControllers,
            onlineControllers,
            totalSchedules,
            activeSchedules,
            todaySchedules
        };
    }, [devices, controllers, schedules]);

    // Dispositivos por tipo
    const devicesByType = useMemo(() => {
        if (!devices) return { lights: 0, pumps: 0, levels: 0, others: 0 };

        return {
            lights: devices.filter((d: DeviceType) => d.type === 'light').length,
            pumps: devices.filter((d: DeviceType) => d.type === 'pump').length,
            levels: devices.filter((d: DeviceType) => d.type === 'level').length,
            others: devices.filter((d: DeviceType) => !['light', 'pump', 'level'].includes(d.type)).length,
        };
    }, [devices]);

    // Alertas (dispositivos offline)
    const alerts = useMemo(() => {
        if (!devices) return [];
        return devices.filter((d: DeviceType) => d.isOnline === false).slice(0, 5);
    }, [devices]);

    // Próximos 5 agendamentos
    const upcomingSchedules = useMemo(() => {
        if (!schedules) return [];
        return schedules
            .filter((s: any) => s.isActive && s.nextExecution)
            .sort((a: any, b: any) => new Date(a.nextExecution!).getTime() - new Date(b.nextExecution!).getTime())
            .slice(0, 5);
    }, [schedules]);

    // Dispositivos críticos (offline ou com alerta)
    const criticalDevices = useMemo(() => {
        if (!devices) return [];
        return devices.filter((d: DeviceType) => d.isOnline === false).slice(0, 6);
    }, [devices]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/30">
                        <Home className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Visão geral do sistema de supervisão</p>
                    </div>
                </div>

                {/* KPIs Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Dispositivos */}
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Dispositivos</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.onlineDevices} online • {stats.offlineDevices} offline
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    {/* Controladores */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Controladores</p>
                                <p className="text-2xl font-bold text-green-600">{stats.onlineControllers}/{stats.totalControllers}</p>
                                <p className="text-xs text-green-600 mt-1">Conectados</p>
                            </div>
                            <Server className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    {/* Agendamentos */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Agendamentos</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.activeSchedules}</p>
                                <p className="text-xs text-blue-600 mt-1">{stats.todaySchedules} hoje</p>
                            </div>
                            <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    {/* Alertas */}
                    <div className={`rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-shadow ${
                        alerts.length > 0
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                            : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${alerts.length > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                                    Alertas
                                </p>
                                <p className={`text-2xl font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {alerts.length}
                                </p>
                                <p className={`text-xs mt-1 ${alerts.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {alerts.length > 0 ? 'Requer atenção' : 'Tudo normal'}
                                </p>
                            </div>
                            {alerts.length > 0 ? (
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            ) : (
                                <CheckCircle className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Linha 2: Distribuição e Alertas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Distribuição de Dispositivos */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold text-gray-900">Dispositivos por Tipo</h2>
                        </div>
                        <div className="space-y-3">
                            {/* Iluminação */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-3">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                    <span className="font-medium text-gray-900">Iluminação</span>
                                </div>
                                <span className="text-xl font-bold text-amber-600">{devicesByType.lights}</span>
                            </div>

                            {/* Bombas */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-gray-900">Bombas</span>
                                </div>
                                <span className="text-xl font-bold text-blue-600">{devicesByType.pumps}</span>
                            </div>

                            {/* Sensores de Nível */}
                            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                                <div className="flex items-center gap-3">
                                    <Droplet className="w-5 h-5 text-cyan-600" />
                                    <span className="font-medium text-gray-900">Sensores de Nível</span>
                                </div>
                                <span className="text-xl font-bold text-cyan-600">{devicesByType.levels}</span>
                            </div>

                            {/* Outros */}
                            {devicesByType.others > 0 && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Gauge className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-900">Outros</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-600">{devicesByType.others}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alertas Ativos */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h2 className="text-lg font-bold text-gray-900">Alertas Ativos</h2>
                        </div>
                        {alerts.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">Nenhum alerta ativo</p>
                                <p className="text-sm text-gray-500 mt-1">Todos os dispositivos estão operando normalmente</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alerts.map((device: DeviceType) => (
                                    <div key={device.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center gap-3">
                                            <WifiOff className="w-4 h-4 text-red-600" />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{device.name}</p>
                                                <p className="text-xs text-red-600">Dispositivo offline</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-red-600 font-medium">OFFLINE</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Linha 3: Próximos Agendamentos */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold text-gray-900">Próximos Agendamentos</h2>
                        </div>
                        <Link href="/schedules" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Ver todos →
                        </Link>
                    </div>

                    {upcomingSchedules.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Nenhum agendamento próximo</p>
                            <p className="text-sm text-gray-500 mt-1">Crie agendamentos para automatizar tarefas</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingSchedules.map((schedule) => (
                                <div key={schedule.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 text-sm">{schedule.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            schedule.recurrenceType === 'once' ? 'bg-purple-100 text-purple-700' :
                                            schedule.recurrenceType === 'daily' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {schedule.recurrenceType === 'once' ? 'Única' :
                                             schedule.recurrenceType === 'daily' ? 'Diária' : 'Semanal'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{schedule.time.hour.toString().padStart(2, '0')}:{schedule.time.minute.toString().padStart(2, '0')}</span>
                                    </div>
                                    <p className="text-xs text-blue-600 font-medium">
                                        {formatDistanceToNow(new Date(schedule.nextExecution!), {
                                            addSuffix: true,
                                            locale: ptBR
                                        })}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <p className="text-xs text-gray-600">
                                            {schedule.actions.length} ação(ões) programada(s)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Linha 4: Ações Rápidas */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-bold text-gray-900">Acesso Rápido</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/lights">
                            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200 hover:shadow-md transition-all cursor-pointer group">
                                <Lightbulb className="w-8 h-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-bold text-gray-900 text-sm">Iluminação</p>
                                <p className="text-xs text-gray-600 mt-1">{devicesByType.lights} dispositivos</p>
                            </div>
                        </Link>

                        <Link href="/schedules">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                                <Calendar className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-bold text-gray-900 text-sm">Agendamentos</p>
                                <p className="text-xs text-gray-600 mt-1">{stats.activeSchedules} ativos</p>
                            </div>
                        </Link>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:shadow-md transition-all cursor-pointer group">
                            <Server className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-bold text-gray-900 text-sm">Controladores</p>
                            <p className="text-xs text-gray-600 mt-1">{stats.onlineControllers} online</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:shadow-md transition-all cursor-pointer group">
                            <Activity className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="font-bold text-gray-900 text-sm">Monitoramento</p>
                            <p className="text-xs text-gray-600 mt-1">Tempo real</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
