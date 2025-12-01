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
    TrendingUp,
    Calendar,
    Download,
    Plus,
    X,
    Activity,
    Zap,
    Thermometer,
    Droplet,
    Gauge,
    ArrowUp,
    ArrowDown,
    Minus,
    Play,
    Pause,
    Trash2,
    Settings,
    RefreshCw,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface TrendVariable {
    id: string;
    deviceId: string;
    deviceName: string;
    variable: string;
    color: string;
    isRecording: boolean;
    updateMode: 'onChange' | 'fixed';
    updateInterval?: number; // em segundos
    maxDataPoints: number;
}

export default function TrendsPage() {
    const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
    const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('15m');
    const [selectedVariables, setSelectedVariables] = useState<TrendVariable[]>([
        {
            id: '1',
            deviceId: 'device-1',
            deviceName: 'Sensor Temperatura Sala',
            variable: 'temperature',
            color: 'rgb(239, 68, 68)',
            isRecording: false,
            updateMode: 'onChange',
            maxDataPoints: 100
        }
    ]);

    // Mock data - Em produção viria da API
    const mockDevices = [
        { id: 'device-1', name: 'Sensor Temperatura Sala', type: 'sensor' },
        { id: 'device-2', name: 'Bomba Piscina', type: 'pump' },
        { id: 'device-3', name: 'Medidor Energia Principal', type: 'meter' },
        { id: 'device-4', name: 'Nível Caixa D\'água', type: 'level' }
    ];

    const mockVariables: Record<string, { name: string; unit: string; icon: any }> = {
        temperature: { name: 'Temperatura', unit: '°C', icon: Thermometer },
        humidity: { name: 'Umidade', unit: '%', icon: Droplet },
        current: { name: 'Corrente', unit: 'A', icon: Zap },
        voltage: { name: 'Tensão', unit: 'V', icon: Activity },
        level: { name: 'Nível', unit: '%', icon: Gauge },
        pressure: { name: 'Pressão', unit: 'bar', icon: Gauge },
        power: { name: 'Potência', unit: 'kW', icon: Zap }
    };

    // Dados do gráfico
    const generateTimeLabels = () => {
        const labels = [];
        const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;

        for (let i = 0; i < points; i++) {
            if (timeRange === '7d') {
                labels.push(`Dia ${i + 1}`);
            } else if (timeRange === '30d') {
                labels.push(`${i + 1}/12`);
            } else {
                labels.push(`${i}:00`);
            }
        }
        return labels;
    };

    const generateMockData = (variableType: string, count: number) => {
        const baseValues: Record<string, number> = {
            temperature: 23,
            humidity: 65,
            current: 12,
            voltage: 220,
            level: 75,
            pressure: 2.5,
            power: 15
        };

        const base = baseValues[variableType] || 50;
        return Array.from({ length: count }, () => base + (Math.random() - 0.5) * 10);
    };

    const chartData = {
        labels: generateTimeLabels(),
        datasets: selectedVariables.map(v => ({
            label: `${v.deviceName} - ${mockVariables[v.variable]?.name || v.variable}`,
            data: generateMockData(v.variable, timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30),
            borderColor: v.color,
            backgroundColor: v.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            fill: true,
            tension: 0.4
        }))
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    };

    // Estatísticas da primeira variável selecionada
    const getStats = (data: number[]) => {
        const current = data[data.length - 1];
        const previous = data[data.length - 2];
        const min = Math.min(...data);
        const max = Math.max(...data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';
        const change = ((current - previous) / previous * 100).toFixed(1);

        return { current, min, max, avg, trend, change };
    };

    const stats = selectedVariables.length > 0
        ? getStats(chartData.datasets[0].data as number[])
        : { current: 0, min: 0, max: 0, avg: 0, trend: 'stable', change: '0' };

    const addVariable = () => {
        const colors = [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(251, 146, 60)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)'
        ];

        const newVariable: TrendVariable = {
            id: Date.now().toString(),
            deviceId: mockDevices[0].id,
            deviceName: mockDevices[0].name,
            variable: 'temperature',
            color: colors[selectedVariables.length % colors.length],
            isRecording: false,
            updateMode: 'onChange',
            maxDataPoints: 100
        };

        setSelectedVariables([...selectedVariables, newVariable]);
    };

    const removeVariable = (id: string) => {
        setSelectedVariables(selectedVariables.filter(v => v.id !== id));
    };

    const updateVariable = (id: string, field: keyof TrendVariable, value: any) => {
        setSelectedVariables(selectedVariables.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    };

    const toggleRecording = (id: string) => {
        updateVariable(id, 'isRecording', !selectedVariables.find(v => v.id === id)?.isRecording);
    };

    const clearData = (id: string) => {
        // Em produção, isso chamaria a API para limpar os dados gravados
        console.log(`Limpar dados da variável ${id}`);
        alert(`Dados da variável limpos (em produção, isto limparia o histórico)`);
    };

    const clearAllData = () => {
        if (confirm('Deseja realmente limpar todos os dados gravados?')) {
            console.log('Limpar todos os dados');
            alert('Todos os dados foram limpos (simulação)');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/30">
                            <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Análise de Tendências</h1>
                            <p className="text-gray-600">Visualize a evolução de variáveis ao longo do tempo</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {/* Time Range and Interval */}
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
                                    <div className="flex gap-2">
                                        {(['1h', '6h', '24h', '7d', '30d'] as const).map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => setTimeRange(range)}
                                                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                                    timeRange === range
                                                        ? 'bg-emerald-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {range === '1h' && '1 hora'}
                                                {range === '6h' && '6 horas'}
                                                {range === '24h' && '24 horas'}
                                                {range === '7d' && '7 dias'}
                                                {range === '30d' && '30 dias'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Intervalo</label>
                                    <select
                                        value={interval}
                                        onChange={(e) => setInterval(e.target.value as any)}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 h-[38px]"
                                    >
                                        <option value="1m">1 minuto</option>
                                        <option value="5m">5 minutos</option>
                                        <option value="15m">15 minutos</option>
                                        <option value="1h">1 hora</option>
                                        <option value="1d">1 dia</option>
                                    </select>
                                </div>

                                <div className="ml-auto flex items-end">
                                    <Button
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white h-[38px]"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Baseado na primeira variável */}
                    {selectedVariables.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="w-8 h-8 text-blue-500" />
                                    {stats.trend === 'up' && <ArrowUp className="w-6 h-6 text-green-500" />}
                                    {stats.trend === 'down' && <ArrowDown className="w-6 h-6 text-red-500" />}
                                    {stats.trend === 'stable' && <Minus className="w-6 h-6 text-gray-500" />}
                                </div>
                                <p className="text-sm font-medium text-blue-700">Valor Atual</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.current.toFixed(1)}</p>
                                <p className={`text-xs mt-1 ${parseFloat(stats.change) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {parseFloat(stats.change) > 0 ? '+' : ''}{stats.change}% vs anterior
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <p className="text-sm font-medium text-gray-600 mb-1">Mínimo</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.min.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">no período</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <p className="text-sm font-medium text-gray-600 mb-1">Máximo</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.max.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">no período</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <p className="text-sm font-medium text-gray-600 mb-1">Média</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.avg.toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">no período</p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <p className="text-sm font-medium text-gray-600 mb-1">Variação</p>
                                <p className="text-3xl font-bold text-gray-900">{(stats.max - stats.min).toFixed(1)}</p>
                                <p className="text-xs text-gray-500 mt-1">amplitude</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Variable Selectors */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Variáveis Gravadas</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={clearAllData}
                                variant="outline"
                                className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                                disabled={selectedVariables.length === 0}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Limpar Tudo
                            </Button>
                            <Button
                                onClick={addVariable}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                disabled={selectedVariables.length >= 5}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Variável
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {selectedVariables.map((variable, index) => (
                            <div key={variable.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                {/* Linha 1: Seleção de Dispositivo e Variável */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: variable.color }}
                                    />

                                    <select
                                        value={variable.deviceId}
                                        onChange={(e) => {
                                            const device = mockDevices.find(d => d.id === e.target.value);
                                            updateVariable(variable.id, 'deviceId', e.target.value);
                                            updateVariable(variable.id, 'deviceName', device?.name || '');
                                        }}
                                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                    >
                                        {mockDevices.map(device => (
                                            <option key={device.id} value={device.id}>{device.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={variable.variable}
                                        onChange={(e) => updateVariable(variable.id, 'variable', e.target.value)}
                                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                    >
                                        {Object.entries(mockVariables).map(([key, { name, unit }]) => (
                                            <option key={key} value={key}>{name} ({unit})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Linha 2: Configurações */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    {/* Modo de Atualização */}
                                    <div className="flex flex-col">
                                        <label className="text-xs font-medium text-gray-600 mb-1">Modo de Atualização</label>
                                        <select
                                            value={variable.updateMode}
                                            onChange={(e) => updateVariable(variable.id, 'updateMode', e.target.value)}
                                            className="px-2 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                        >
                                            <option value="onChange">Ao Mudar</option>
                                            <option value="fixed">Intervalo Fixo</option>
                                        </select>
                                    </div>

                                    {/* Intervalo (apenas se modo fixed) */}
                                    {variable.updateMode === 'fixed' && (
                                        <div className="flex flex-col">
                                            <label className="text-xs font-medium text-gray-600 mb-1">Intervalo (s)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="3600"
                                                value={variable.updateInterval || 60}
                                                onChange={(e) => updateVariable(variable.id, 'updateInterval', parseInt(e.target.value))}
                                                className="px-2 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                            />
                                        </div>
                                    )}

                                    {/* Máximo de Pontos */}
                                    <div className="flex flex-col">
                                        <label className="text-xs font-medium text-gray-600 mb-1">Máx. Pontos</label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="10000"
                                            value={variable.maxDataPoints}
                                            onChange={(e) => updateVariable(variable.id, 'maxDataPoints', parseInt(e.target.value))}
                                            className="px-2 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Linha 3: Ações */}
                                <div className="flex items-center gap-2">
                                    {/* Botão Gravar/Pausar */}
                                    <button
                                        onClick={() => toggleRecording(variable.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                                            variable.isRecording
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        }`}
                                    >
                                        {variable.isRecording ? (
                                            <>
                                                <Pause className="w-4 h-4" />
                                                <span className="text-sm">Pausar</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                <span className="text-sm">Gravar</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Status de Gravação */}
                                    {variable.isRecording && (
                                        <div className="flex items-center gap-1 text-sm text-red-600 animate-pulse">
                                            <div className="w-2 h-2 bg-red-600 rounded-full" />
                                            <span>Gravando</span>
                                        </div>
                                    )}

                                    {/* Info do Modo */}
                                    <div className="flex items-center gap-1 text-xs text-gray-600 ml-2">
                                        {variable.updateMode === 'onChange' ? (
                                            <>
                                                <RefreshCw className="w-3 h-3" />
                                                <span>Ao mudar</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-3 h-3" />
                                                <span>A cada {variable.updateInterval || 60}s</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="ml-auto flex gap-2">
                                        <button
                                            onClick={() => clearData(variable.id)}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Limpar dados desta variável"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeVariable(variable.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            disabled={selectedVariables.length === 1}
                                            title="Remover variável"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedVariables.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhuma variável selecionada. Clique em "Adicionar Variável" para começar.
                        </div>
                    )}
                </div>

                {/* Main Chart */}
                {selectedVariables.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-lg font-bold text-gray-900">Evolução Temporal</h2>
                        </div>
                        <div className="h-96">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
