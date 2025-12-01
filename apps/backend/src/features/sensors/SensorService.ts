import { EventBus } from "../../shared/event-bus";
import { SensorDevice } from "./Sensor";
import type { Sensor, CreateSensorDTO } from "./sensor.types";

/**
 * SENSOR SERVICE - Gerencia todos os sensores
 *
 * - Singleton
 * - Escuta eventos do EventBus
 * - CRUD de sensores
 * - NÃO executa comandos (sensores são read-only)
 */
export class SensorService {
    private static instance: SensorService | null = null;
    private sensors: Map<string, SensorDevice> = new Map();

    private constructor() {
        console.log('[SensorService] Inicializado');
    }

    public static getInstance(): SensorService {
        if (!SensorService.instance) {
            SensorService.instance = new SensorService();
        }
        return SensorService.instance;
    }

    /**
     * Cria novo sensor
     */
    public create(dto: CreateSensorDTO): SensorDevice {
        const sensor = SensorDevice.create(dto);
        this.sensors.set(sensor.id, sensor);

        console.log(`[SensorService] Sensor criado: ${sensor.id} (${sensor.type})`);

        // Emite evento de criação
        EventBus.getInstance().publish('sensor_created', {
            sensorId: sensor.id,
            type: sensor.type
        });

        return sensor;
    }

    /**
     * Busca sensor por ID
     */
    public findById(id: string): SensorDevice | undefined {
        return this.sensors.get(id);
    }

    /**
     * Lista todos os sensores
     */
    public findAll(): SensorDevice[] {
        return Array.from(this.sensors.values());
    }

    /**
     * Filtra sensores por tipo
     */
    public findByType(type: Sensor['type']): SensorDevice[] {
        return Array.from(this.sensors.values()).filter(sensor => sensor.type === type);
    }

    /**
     * Filtra sensores por localização
     */
    public findByLocation(location: string): SensorDevice[] {
        return Array.from(this.sensors.values()).filter(
            sensor => sensor.location?.toLowerCase().includes(location.toLowerCase())
        );
    }

    /**
     * Atualiza sensor
     */
    public update(id: string, data: { name?: string; location?: string }): SensorDevice {
        const sensor = this.sensors.get(id);
        if (!sensor) {
            throw new Error(`Sensor ${id} não encontrado`);
        }

        if (data.name) {
            sensor.name = data.name;
        }

        if (data.location !== undefined) {
            sensor.location = data.location;
        }

        console.log(`[SensorService] Sensor ${id} atualizado`);

        // Emite evento de atualização
        EventBus.getInstance().publish('sensor_updated', {
            sensorId: id
        });

        return sensor;
    }

    /**
     * Remove sensor
     */
    public delete(id: string): void {
        const sensor = this.sensors.get(id);
        if (!sensor) {
            throw new Error(`Sensor ${id} não encontrado`);
        }

        // Cleanup
        sensor.destroy();
        this.sensors.delete(id);

        console.log(`[SensorService] Sensor ${id} removido`);

        // Emite evento de remoção
        EventBus.getInstance().publish('sensor_deleted', {
            sensorId: id
        });
    }

    /**
     * Busca sensores online
     */
    public findOnline(): SensorDevice[] {
        return Array.from(this.sensors.values()).filter(sensor => sensor.isOnline);
    }

    /**
     * Busca sensores offline
     */
    public findOffline(): SensorDevice[] {
        return Array.from(this.sensors.values()).filter(sensor => !sensor.isOnline);
    }

    /**
     * Conta sensores por tipo
     */
    public countByType(): Record<Sensor['type'], number> {
        const counts: Record<string, number> = {
            light_sensor: 0,
            temperature_sensor: 0,
            pressure_sensor: 0,
            flow_sensor: 0,
            level_sensor: 0,
            motion_sensor: 0
        };

        for (const sensor of this.sensors.values()) {
            counts[sensor.type]++;
        }

        return counts as Record<Sensor['type'], number>;
    }

    /**
     * Retorna últimas leituras de um sensor
     * TODO: Implementar histórico com database
     */
    public getHistory(id: string, limit: number = 100): any[] {
        const sensor = this.sensors.get(id);
        if (!sensor) {
            throw new Error(`Sensor ${id} não encontrado`);
        }

        // Por enquanto retorna apenas valor atual
        // Quando tiver database, retornar histórico real
        return [{
            timestamp: sensor.lastUpdate,
            value: sensor.getValue().value,
            unit: sensor.unit
        }];
    }

    /**
     * Status do serviço
     */
    public getStatus() {
        return {
            total: this.sensors.size,
            online: this.findOnline().length,
            offline: this.findOffline().length,
            byType: this.countByType()
        };
    }

    /**
     * Shutdown - limpa todos os recursos
     */
    public shutdown(): void {
        console.log('[SensorService] Desligando...');

        // Destroi todos os sensores
        for (const sensor of this.sensors.values()) {
            sensor.destroy();
        }

        this.sensors.clear();

        console.log('[SensorService] Desligado');
    }
}
