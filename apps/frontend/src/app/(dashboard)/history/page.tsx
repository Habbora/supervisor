'use client';

import { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import {
    History,
    Calendar,
    Download,
    Filter,
    Search,
    Activity,
    Zap,
    Lightbulb,
    Power
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function HistoryPage() {
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
    const [filterType, setFilterType] = useState<'all' | 'energy' | 'devices' | 'alerts'>('all');

    // Dados históricos de consumo
    const historicalEnergyData = {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Semana Atual',
                data: [145, 168, 152, 178, 165, 142, 138],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Semana Anterior',
                data: [132, 155, 148, 162, 158, 135, 130],
                borderColor: 'rgb(156, 163, 175)',
                backgroundColor: 'rgba(156, 163, 175, 0.1)',
                fill: true,
                tension: 0.4,
                borderDash: [5, 5]
            }
        ]
    };

    // Dados de uso por dispositivo
    const deviceUsageData = {
        labels: ['Iluminação', 'Ar Condicionado', 'Tomadas', 'Bombas', 'Outros'],
        datasets: [
            {
                label: 'Horas de Uso',
                data: [125, 89, 156, 45, 67],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(249, 115, 22, 0.8)'
                ]
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

    // Logs de eventos
    const eventLogs = [
        { id: 1, type: 'device', action: 'Luz Sala ligada', user: 'João Silva', time: new Date(), icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
        { id: 2, type: 'energy', action: 'Pico de consumo detectado', user: 'Sistema', time: new Date(Date.now() - 1000 * 60 * 15), icon: Zap, color: 'text-orange-600 bg-orange-50' },
        { id: 3, type: 'device', action: 'Bomba #2 desligada', user: 'Maria Santos', time: new Date(Date.now() - 1000 * 60 * 30), icon: Power, color: 'text-red-600 bg-red-50' },
        { id: 4, type: 'device', action: 'Ar Condicionado ativado', user: 'Pedro Costa', time: new Date(Date.now() - 1000 * 60 * 45), icon: Activity, color: 'text-blue-600 bg-blue-50' },
        { id: 5, type: 'device', action: 'Luz Quarto desligada', user: 'Ana Lima', time: new Date(Date.now() - 1000 * 60 * 60), icon: Lightbulb, color: 'text-gray-600 bg-gray-50' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
                            <History className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Histórico e Logs</h1>
                            <p className="text-gray-600">Análise histórica de dados e eventos do sistema</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                            {/* Date Range */}
                            <div className="flex gap-2">
                                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                            dateRange === range
                                                ? 'bg-purple-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {range === '7d' && '7 dias'}
                                        {range === '30d' && '30 dias'}
                                        {range === '90d' && '90 dias'}
                                        {range === '1y' && '1 ano'}
                                    </button>
                                ))}
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                                >
                                    <option value="all">Todos os Eventos</option>
                                    <option value="energy">Energia</option>
                                    <option value="devices">Dispositivos</option>
                                    <option value="alerts">Alertas</option>
                                </select>

                                <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-1">Consumo Total</p>
                            <p className="text-2xl font-bold text-gray-900">1,245 kWh</p>
                            <p className="text-xs text-green-600 mt-1">↓ 8% vs período anterior</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-1">Eventos Registrados</p>
                            <p className="text-2xl font-bold text-gray-900">2,847</p>
                            <p className="text-xs text-blue-600 mt-1">↑ 12% vs período anterior</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-1">Custo Estimado</p>
                            <p className="text-2xl font-bold text-gray-900">R$ 847,50</p>
                            <p className="text-xs text-green-600 mt-1">↓ 5% vs período anterior</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-600 mb-1">Média Diária</p>
                            <p className="text-2xl font-bold text-gray-900">178 kWh</p>
                            <p className="text-xs text-gray-600 mt-1">Nos últimos 7 dias</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Histórico de Consumo */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-bold text-gray-900">Histórico de Consumo</h2>
                        </div>
                        <div className="h-64">
                            <Line data={historicalEnergyData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Uso por Tipo de Dispositivo */}
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-bold text-gray-900">Uso por Tipo de Dispositivo</h2>
                        </div>
                        <div className="h-64">
                            <Bar data={deviceUsageData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Event Logs */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-bold text-gray-900">Registro de Eventos</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar eventos..."
                                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {eventLogs.map((log) => {
                            const Icon = log.icon;
                            return (
                                <div key={log.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className={`p-2 rounded-lg ${log.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-600">por {log.user}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600">
                                            {format(log.time, "dd/MM/yyyy", { locale: ptBR })}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(log.time, "HH:mm", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 text-center">
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            Carregar mais eventos
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
