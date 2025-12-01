import { EventBus } from "../../shared/event-bus";
import type {
    Sensor,
    LightSensor,
    TemperatureSensor,
    PressureSensor,
    FlowSensor,
    LevelSensor,
    MotionSensor,
    SensorEndpoint,
    CreateSensorDTO
} from "./sensor.types";

/**
 * SENSOR DEVICE - FORTEMENTE TIPADO
 *
 * Sensores são READ-ONLY (inputs)
 * NÃO aceitam comandos, apenas reportam valores
 *
 * Tipos suportados:
 * - LightSensor: luminosidade (lux, %, cd/m²)
 * - TemperatureSensor: temperatura (°C, °F, K)
 * - PressureSensor: pressão (PSI, bar, Pa, kPa)
 * - FlowSensor: fluxo (L/min, L/h, m³/h, GPM)
 * - LevelSensor: nível (%, m, cm, mm, ft)
 * - MotionSensor: movimento (boolean)
 */
export class SensorDevice implements Sensor {
    public readonly id: string;
    public readonly type: Sensor['type'];
    public name: string;
    public location?: string;
    public isOnline: boolean = false;
    public lastUpdate: Date = new Date(0);
    public unit: string;

    // Endpoint único (todos os sensores têm apenas 1 endpoint input)
    public endpoint: SensorEndpoint;

    private onEndpointUpdateCallback: (data: any) => void;

    constructor(data: Sensor) {
        this.id = data.id;
        this.type = data.type;
        this.name = data.name;
        this.location = data.location;
        this.isOnline = data.isOnline;
        this.lastUpdate = data.lastUpdate;
        this.unit = data.unit;

        // Copia endpoint
        this.endpoint = { ...data.endpoint };

        // Bind callback
        this.onEndpointUpdateCallback = this.handleEndpointUpdate.bind(this);

        // Escuta atualizações de endpoints
        EventBus.getInstance().subscribe('endpoint_event', this.onEndpointUpdateCallback);

        // Força leitura inicial
        this.requestCurrentValue();
    }

    /**
     * Atualização de endpoint vindo do controller
     */
    private handleEndpointUpdate(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }): void {
        // Verifica se é o endpoint deste sensor
        if (
            data.controllerId === this.endpoint.controllerId &&
            data.endpointName === this.endpoint.endpointName
        ) {
            const oldValue = this.endpoint.value;
            this.endpoint.value = data.value;
            this.isOnline = true;
            this.lastUpdate = new Date();

            // Emite evento de mudança
            EventBus.getInstance().publish('sensor_value_changed', {
                sensorId: this.id,
                type: this.type,
                oldValue,
                newValue: data.value,
                unit: this.unit,
                timestamp: this.lastUpdate
            });
        }
    }

    /**
     * Solicita valor atual do endpoint
     */
    private requestCurrentValue(): void {
        EventBus.getInstance().publish('force_read_endpoint', {
            controllerId: this.endpoint.controllerId,
            endpointName: this.endpoint.endpointName
        });
    }

    /**
     * Retorna valor atual com unidade
     */
    public getValue(): { value: number; unit: string } {
        return {
            value: this.endpoint.value,
            unit: this.unit
        };
    }

    /**
     * Serializa para enviar ao frontend
     */
    public toJSON(): any {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            location: this.location,
            isOnline: this.isOnline,
            lastUpdate: this.lastUpdate.toISOString(),
            value: this.endpoint.value ?? -1,
            unit: this.unit,
            endpoint: {
                controllerId: this.endpoint.controllerId,
                endpointName: this.endpoint.endpointName
            }
        };
    }

    /**
     * Cleanup
     */
    public destroy(): void {
        EventBus.getInstance().unsubscribe('endpoint_event', this.onEndpointUpdateCallback);
    }

    /**
     * Factory method - cria sensor baseado no DTO
     */
    public static create(dto: CreateSensorDTO): SensorDevice {
        const id = crypto.randomUUID();

        if (dto.type === 'light_sensor') {
            const sensor: LightSensor = {
                id,
                type: 'light_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: dto.data.unit,
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'analog',
                    direction: 'input',
                    value: -1,
                    min: dto.data.min ?? 0,
                    max: dto.data.max ?? (dto.data.unit === 'lux' ? 100000 : 100)
                }
            };
            return new SensorDevice(sensor);
        }

        if (dto.type === 'temperature_sensor') {
            const sensor: TemperatureSensor = {
                id,
                type: 'temperature_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: dto.data.unit,
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'analog',
                    direction: 'input',
                    value: -1,
                    min: dto.data.min ?? -50,
                    max: dto.data.max ?? 150
                }
            };
            return new SensorDevice(sensor);
        }

        if (dto.type === 'pressure_sensor') {
            const sensor: PressureSensor = {
                id,
                type: 'pressure_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: dto.data.unit,
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'analog',
                    direction: 'input',
                    value: -1,
                    min: dto.data.min ?? 0,
                    max: dto.data.max ?? 200
                }
            };
            return new SensorDevice(sensor);
        }

        if (dto.type === 'flow_sensor') {
            const sensor: FlowSensor = {
                id,
                type: 'flow_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: dto.data.unit,
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'analog',
                    direction: 'input',
                    value: -1,
                    min: dto.data.min ?? 0,
                    max: dto.data.max ?? 1000
                }
            };
            return new SensorDevice(sensor);
        }

        if (dto.type === 'level_sensor') {
            const sensor: LevelSensor = {
                id,
                type: 'level_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: dto.data.unit,
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'analog',
                    direction: 'input',
                    value: -1,
                    min: dto.data.min ?? 0,
                    max: dto.data.max ?? (dto.data.unit === '%' ? 100 : 10)
                }
            };
            return new SensorDevice(sensor);
        }

        if (dto.type === 'motion_sensor') {
            const sensor: MotionSensor = {
                id,
                type: 'motion_sensor',
                name: dto.data.name,
                location: dto.data.location,
                isOnline: false,
                lastUpdate: new Date(0),
                unit: 'boolean',
                endpoint: {
                    name: 'default',
                    controllerId: dto.data.controllerId,
                    endpointName: dto.data.endpointName,
                    type: 'digital',
                    direction: 'input',
                    value: -1,
                    min: 0,
                    max: 1
                }
            };
            return new SensorDevice(sensor);
        }

        throw new Error('Tipo de sensor inválido');
    }
}
