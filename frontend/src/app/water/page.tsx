import { fetchBackend, fetchWithCache, fetchFresh } from '@/utils/api';

// Buscar dados dos dispositivos de água
async function fetchWaterDevices() {
    try {
        return await fetchBackend('devices/water');
    } catch (error) {
        console.error('Erro ao buscar dispositivos de água:', error);
        return [];
    }
}

// Buscar dados de sensores com cache
async function fetchWaterSensors() {
    try {
        return await fetchWithCache('/api/water/sensors', 30);
    } catch (error) {
        console.error('Erro ao buscar sensores de água:', error);
        return [];
    }
}

// Buscar dados em tempo real (sem cache)
async function fetchWaterStatus() {
    try {
        return await fetchFresh('/api/water/status');
    } catch (error) {
        console.error('Erro ao buscar status da água:', error);
        return null;
    }
}

export default async function WaterPage() {
    // Buscar todos os dados em paralelo
    const [devices, sensors, status] = await Promise.all([
        fetchWaterDevices(),
        fetchWaterSensors(),
        fetchWaterStatus()
    ]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Controle de Água</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispositivos */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Dispositivos</h2>
                    {devices.length > 0 ? (
                        <div className="space-y-2">
                            {devices.map((device: any) => (
                                <div key={device.id} className="p-3 bg-gray-50 rounded">
                                    <h3 className="font-medium">{device.name}</h3>
                                    <p className="text-sm text-gray-600">{device.type}</p>
                                    <p className="text-sm text-gray-500">Status: {device.status}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhum dispositivo encontrado</p>
                    )}
                </div>

                {/* Sensores */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Sensores</h2>
                    {sensors.length > 0 ? (
                        <div className="space-y-2">
                            {sensors.map((sensor: any) => (
                                <div key={sensor.id} className="p-3 bg-blue-50 rounded">
                                    <h3 className="font-medium">{sensor.name}</h3>
                                    <p className="text-sm text-gray-600">Valor: {sensor.value}</p>
                                    <p className="text-sm text-gray-500">Unidade: {sensor.unit}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhum sensor encontrado</p>
                    )}
                </div>

                {/* Status em Tempo Real */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Status em Tempo Real</h2>
                    {status ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 rounded">
                                <h3 className="font-medium">Sistema</h3>
                                <p className="text-sm text-gray-600">Status: {status.system}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded">
                                <h3 className="font-medium">Pressão</h3>
                                <p className="text-sm text-gray-600">{status.pressure} bar</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded">
                                <h3 className="font-medium">Nível</h3>
                                <p className="text-sm text-gray-600">{status.level}%</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Status não disponível</p>
                    )}
                </div>
            </div>
        </div>
    );
} 