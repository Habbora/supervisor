'use client';

import { useState } from 'react';
import {
    Droplet,
    AlertTriangle,
    CheckCircle,
    Power,
    Gauge,
    Wind,
    ThermometerSun
} from 'lucide-react';

interface WaterTank {
    id: string;
    name: string;
    currentLevel: number; // 0-100%
    capacity: number; // em litros
    minLevel: number; // nível mínimo de alerta
    maxLevel: number; // nível máximo
    temperature?: number;
}

interface Pump {
    id: string;
    name: string;
    type: 'elevatoria' | 'pluvial' | 'esgoto';
    isRunning: boolean;
    status: 'normal' | 'warning' | 'error';
}

export default function WaterSystemPage() {

    // Mock data - Reservatórios
    const tanks: WaterTank[] = [
        {
            id: 'tank-1',
            name: 'Caixa Principal',
            currentLevel: 75,
            capacity: 10000,
            minLevel: 20,
            maxLevel: 95,
            temperature: 24
        },
        {
            id: 'tank-2',
            name: 'Reservatório Superior',
            currentLevel: 45,
            capacity: 5000,
            minLevel: 15,
            maxLevel: 95,
            temperature: 23
        },
        {
            id: 'tank-3',
            name: 'Cisterna Pluvial',
            currentLevel: 88,
            capacity: 15000,
            minLevel: 10,
            maxLevel: 95,
            temperature: 22
        },
        {
            id: 'tank-4',
            name: 'Reserva Técnica',
            currentLevel: 12,
            capacity: 3000,
            minLevel: 20,
            maxLevel: 95,
            temperature: 25
        }
    ];

    // Mock data - Bombas
    const pumps: Pump[] = [
        {
            id: 'pump-1',
            name: 'Bomba Elevatória 1',
            type: 'elevatoria',
            isRunning: true,
            status: 'normal'
        },
        {
            id: 'pump-2',
            name: 'Bomba Elevatória 2',
            type: 'elevatoria',
            isRunning: false,
            status: 'normal'
        },
        {
            id: 'pump-3',
            name: 'Bomba Pluvial',
            type: 'pluvial',
            isRunning: false,
            status: 'normal'
        },
        {
            id: 'pump-4',
            name: 'Bomba Esgoto Principal',
            type: 'esgoto',
            isRunning: true,
            status: 'warning'
        },
        {
            id: 'pump-5',
            name: 'Bomba Esgoto Secundária',
            type: 'esgoto',
            isRunning: false,
            status: 'normal'
        }
    ];


    const getTankStatus = (tank: WaterTank) => {
        if (tank.currentLevel <= tank.minLevel) return 'critical';
        if (tank.currentLevel <= tank.minLevel + 10) return 'warning';
        if (tank.currentLevel >= tank.maxLevel) return 'full';
        return 'normal';
    };

    const getTankColor = (status: string) => {
        switch (status) {
            case 'critical': return 'from-red-500 to-orange-500';
            case 'warning': return 'from-yellow-500 to-orange-500';
            case 'full': return 'from-green-500 to-emerald-500';
            default: return 'from-blue-500 to-cyan-500';
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

    // Estatísticas
    const stats = {
        totalCapacity: tanks.reduce((sum, t) => sum + t.capacity, 0),
        currentVolume: tanks.reduce((sum, t) => sum + (t.capacity * t.currentLevel / 100), 0),
        activePumps: pumps.filter(p => p.isRunning).length,
        totalPumps: pumps.length,
        criticalTanks: tanks.filter(t => getTankStatus(t) === 'critical').length,
        warningTanks: tanks.filter(t => getTankStatus(t) === 'warning').length
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
                            <h1 className="text-3xl font-bold text-gray-900">Sistema de Água</h1>
                            <p className="text-gray-600">Monitoramento de reservatórios e bombas hidráulicas</p>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Droplet className="w-8 h-8 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                                    {((stats.currentVolume / stats.totalCapacity) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-sm font-medium text-blue-700">Volume Total</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {(stats.currentVolume / 1000).toFixed(1)}m³
                            </p>
                            <p className="text-xs text-blue-600 mt-1">de {(stats.totalCapacity / 1000).toFixed(0)}m³</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Power className="w-8 h-8 text-green-500" />
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <p className="text-sm font-medium text-green-700">Bombas Ativas</p>
                            <p className="text-3xl font-bold text-green-600">{stats.activePumps}/{stats.totalPumps}</p>
                            <p className="text-xs text-green-600 mt-1">em operação</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Gauge className="w-8 h-8 text-purple-500" />
                                <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">Total</span>
                            </div>
                            <p className="text-sm font-medium text-purple-700">Reservatórios</p>
                            <p className="text-3xl font-bold text-purple-600">{tanks.length}</p>
                            <p className="text-xs text-purple-600 mt-1">monitorados</p>
                        </div>

                        <div className={`rounded-xl p-4 border-2 shadow-sm ${
                            stats.criticalTanks > 0
                                ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                                : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                {stats.criticalTanks > 0 ? (
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                ) : (
                                    <CheckCircle className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <p className={`text-sm font-medium ${stats.criticalTanks > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                                Alertas
                            </p>
                            <p className={`text-3xl font-bold ${stats.criticalTanks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {stats.criticalTanks}
                            </p>
                            <p className={`text-xs mt-1 ${stats.criticalTanks > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {stats.criticalTanks > 0 ? 'níveis críticos' : 'tudo normal'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reservatórios */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Gauge className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold text-gray-900">Reservatórios e Caixas d'água</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tanks.map((tank) => {
                            const status = getTankStatus(tank);
                            const currentVolume = (tank.capacity * tank.currentLevel / 100);

                            return (
                                <div key={tank.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                    {/* Nome e Status */}
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-gray-900 text-sm">{tank.name}</h3>
                                        {status === 'critical' && (
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                        )}
                                        {status === 'warning' && (
                                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                        )}
                                        {status === 'normal' && (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>

                                    {/* Visualização do Tanque */}
                                    <div className="relative h-32 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden mb-3">
                                        {/* Nível da água */}
                                        <div
                                            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getTankColor(status)} transition-all duration-500`}
                                            style={{ height: `${tank.currentLevel}%` }}
                                        >
                                            {/* Efeito de onda */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30"></div>
                                        </div>

                                        {/* Marcadores de nível */}
                                        <div className="absolute inset-0 flex flex-col justify-between p-2">
                                            <span className="text-xs text-gray-600 font-medium">100%</span>
                                            <span className="text-xs text-gray-600 font-medium">50%</span>
                                            <span className="text-xs text-gray-600 font-medium">0%</span>
                                        </div>

                                        {/* Nível atual no centro */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white drop-shadow-lg">
                                                {tank.currentLevel}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Informações */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Volume:</span>
                                            <span className="font-semibold text-gray-900">
                                                {(currentVolume / 1000).toFixed(1)}m³
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Capacidade:</span>
                                            <span className="font-semibold text-gray-900">
                                                {(tank.capacity / 1000).toFixed(0)}m³
                                            </span>
                                        </div>
                                        {tank.temperature && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">Temperatura:</span>
                                                <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                    <ThermometerSun className="w-3 h-3" />
                                                    {tank.temperature}°C
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                            status === 'critical' ? 'bg-red-100 text-red-700' :
                                            status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                            status === 'full' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {status === 'critical' && 'Nível Crítico'}
                                            {status === 'warning' && 'Nível Baixo'}
                                            {status === 'full' && 'Cheio'}
                                            {status === 'normal' && 'Normal'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bombas */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Wind className="w-5 h-5 text-cyan-500" />
                        <h2 className="text-lg font-bold text-gray-900">Bombas Hidráulicas</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pumps.map((pump) => (
                            <div key={pump.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPumpTypeColor(pump.type)} flex items-center justify-center shadow-md`}>
                                            <Power className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">{pump.name}</h3>
                                            <span className="text-xs text-gray-500">{getPumpTypeLabel(pump.type)}</span>
                                        </div>
                                    </div>
                                    {pump.status === 'warning' && (
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    )}
                                    {pump.status === 'error' && (
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center justify-center py-6">
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                        pump.isRunning
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        <div className={`w-3 h-3 rounded-full ${pump.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {pump.isRunning ? 'Em Operação' : 'Desligada'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
