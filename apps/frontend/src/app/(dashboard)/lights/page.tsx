'use client';

import { useLights, Light } from '@/features/lights/hooks/useLights';
import { ModernLightCard } from '@/components/devices/ModernLightCard';
import { Lightbulb, Search, Power, Zap, Sparkles, Home, Building } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';

export default function LightsPage() {
  const { lights, sendCommand } = useLights();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTogglingAll, setIsTogglingAll] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Usar diretamente as lâmpadas do hook
  const lightDevices = useMemo(() => {
    if (!lights || !Array.isArray(lights)) return [];
    return lights;
  }, [lights]);

  // Extrair grupos únicos das lâmpadas
  const groups = useMemo(() => {
    const uniqueGroups = new Set<string>();
    lightDevices.forEach(light => {
      if (light.group) uniqueGroups.add(light.group);
    });
    return Array.from(uniqueGroups).sort();
  }, [lightDevices]);

  // Filtrar lâmpadas por grupo ativo
  const filteredByGroup = useMemo(() => {
    if (activeTab === 'all') return lightDevices;
    return lightDevices.filter(light => light.group === activeTab);
  }, [lightDevices, activeTab]);

  // Filtrar luzes baseado na busca (dentro do grupo ativo)
  const filteredLights = useMemo(() => {
    if (!searchQuery.trim()) return filteredByGroup;
    const query = searchQuery.toLowerCase();
    return filteredByGroup.filter(light =>
      light.name.toLowerCase().includes(query) ||
      light.id.toLowerCase().includes(query)
    );
  }, [filteredByGroup, searchQuery]);

  // Estatísticas (baseadas no grupo ativo)
  const stats = useMemo(() => {
    const total = filteredByGroup.length;
    const onCount = filteredByGroup.filter(light => Boolean(light.value)).length;
    const offCount = total - onCount;
    const offlineCount = filteredByGroup.filter(light => light.isOnline === false).length;

    return { total, onCount, offCount, offlineCount };
  }, [filteredByGroup]);

  // Toggle individual
  const handleToggleLight = async (deviceId: string) => {
    try {
      await sendCommand(deviceId, 'toggle');
    } catch (error) {
      console.error('Erro ao alternar luz:', error);
    }
  };

  // Toggle todas as luzes (apenas do grupo ativo)
  const handleToggleAll = async (turnOn: boolean) => {
    setIsTogglingAll(true);

    try {
      const lightsToToggle = filteredByGroup.filter(light => {
        const isOn = Boolean(light.value);
        const isOffline = light.isOnline === false;
        // Toggle apenas luzes que estão online e no estado oposto ao desejado
        return !isOffline && (turnOn ? !isOn : isOn);
      });

      // Executar em paralelo com pequeno delay entre cada uma
      for (let i = 0; i < lightsToToggle.length; i++) {
        handleToggleLight(lightsToToggle[i].id);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms entre cada toggle
      }
    } catch (error) {
      console.error('Erro ao alternar todas as luzes:', error);
    } finally {
      setTimeout(() => setIsTogglingAll(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/30">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Iluminação</h1>
              <p className="text-gray-600">Controle centralizado de todas as luzes</p>
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
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Ligadas</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.onCount}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Desligadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.offCount}</p>
                </div>
                <Power className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Offline</p>
                  <p className="text-2xl font-bold text-red-600">{stats.offlineCount}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                  !
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de Grupos */}
        {groups.length > 0 && (
          <Tabs
            tabs={[
              {
                value: 'all',
                label: 'Todas',
                icon: <Sparkles className="w-4 h-4" />,
                count: lightDevices.length,
              },
              ...groups.map(group => ({
                value: group,
                label: group,
                icon: group === 'Internos' ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />,
                count: lightDevices.filter(l => l.group === group).length,
              })),
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        )}

        {/* Controls Bar */}
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar luz pelo nome ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>

            {/* Toggle All Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleToggleAll(true)}
                disabled={isTogglingAll || stats.onCount === stats.total}
                variant="default"
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Ligar Todas
              </Button>

              <Button
                onClick={() => handleToggleAll(false)}
                disabled={isTogglingAll || stats.offCount === stats.total}
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <Power className="w-4 h-4 mr-2" />
                Desligar Todas
              </Button>
            </div>
          </div>
        </div>

        {/* Lights Grid */}
        {filteredLights.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Nenhuma luz encontrada' : 'Nenhuma luz disponível'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Tente ajustar sua busca ou limpar o filtro.'
                : 'Adicione dispositivos de iluminação nas configurações.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLights.map((light) => (
              <ModernLightCard
                key={light.id}
                device={light}
                onToggle={handleToggleLight}
              />
            ))}
          </div>
        )}

        {/* Footer Info */}
        {filteredLights.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Mostrando {filteredLights.length} {searchQuery && `de ${filteredByGroup.length}`} {activeTab !== 'all' ? `luz${filteredLights.length !== 1 ? 'es' : ''} em ${activeTab}` : `luz${filteredLights.length !== 1 ? 'es' : ''}`}
          </div>
        )}
      </div>
    </div>
  );
}
