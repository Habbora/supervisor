'use client';

import { useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    Monitor,
    Activity,
    Zap,
    Thermometer,
    Droplet,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function MonitoringPage() {
    const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

    // Dados para gráfico de linha - Consumo de Energia
    const energyData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
            {
                label: 'Consumo (kW)',
                data: [12, 19, 15, 25, 22, 18],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Dados para gráfico de rosca - Status dos Dispositivos
    const deviceStatusData = {
        labels: ['Online', 'Offline', 'Manutenção'],
        datasets: [
            {
                data: [45, 5, 2],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(234, 179, 8)'
                ],
                borderWidth: 0
            }
        ]
    };

    // Dados para gráfico de barras - Uso por Ambiente
    const roomUsageData = {
        labels: ['Sala', 'Cozinha', 'Quarto 1', 'Quarto 2', 'Banheiro', 'Garagem'],
        datasets: [
            {
                label: 'Uso (%)',
                data: [85, 65, 45, 50, 30, 20],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Monitor className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Monitoramento em Tempo Real</h1>
                            <p className="text-gray-600">Acompanhe o status e desempenho dos seus dispositivos</p>
                        </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                        {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    timeRange === range
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                {range === '1h' && 'Última hora'}
                                {range === '6h' && '6 horas'}
                                {range === '24h' && '24 horas'}
                                {range === '7d' && '7 dias'}
                            </button>
                        ))}
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <span className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full">+2.5%</span>
                            </div>
                            <p className="text-sm font-medium text-green-700">Dispositivos Online</p>
                            <p className="text-3xl font-bold text-green-600">45/52</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Zap className="w-8 h-8 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-1 rounded-full">-1.2%</span>
                            </div>
                            <p className="text-sm font-medium text-blue-700">Consumo Atual</p>
                            <p className="text-3xl font-bold text-blue-600">22.5 kW</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Thermometer className="w-8 h-8 text-purple-500" />
                                <span className="text-xs font-medium text-purple-700 bg-purple-200 px-2 py-1 rounded-full">Normal</span>
                            </div>
                            <p className="text-sm font-medium text-purple-700">Temperatura Média</p>
                            <p className="text-3xl font-bold text-purple-600">23.5°C</p>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border-2 border-cyan-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <Droplet className="w-8 h-8 text-cyan-500" />
                                <span className="text-xs font-medium text-cyan-700 bg-cyan-200 px-2 py-1 rounded-full">Ideal</span>
                            </div>
                            <p className="text-sm font-medium text-cyan-700">Umidade Média</p>
                            <p className="text-3xl font-bold text-cyan-600">65%</p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Linha - Consumo de Energia */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold text-gray-900">Consumo de Energia</h2>
                        </div>
                        <div className="h-64">
                            <Line data={energyData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Gráfico de Rosca - Status dos Dispositivos */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-bold text-gray-900">Status Dispositivos</h2>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut data={deviceStatusData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Gráfico de Barras - Uso por Ambiente */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <h2 className="text-lg font-bold text-gray-900">Uso por Ambiente</h2>
                    </div>
                    <div className="h-64">
                        <Bar data={roomUsageData} options={chartOptions} />
                    </div>
                </div>

                {/* Alertas Recentes */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-bold text-gray-900">Alertas Recentes</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Consumo elevado detectado</p>
                                <p className="text-xs text-gray-600">Sala - Há 5 minutos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Dispositivo reconectado</p>
                                <p className="text-xs text-gray-600">Quarto 1 - Há 12 minutos</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
