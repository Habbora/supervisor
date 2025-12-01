/**
 * TIPOS DE SENSORES - FORTEMENTE TIPADOS
 *
 * Sensores são sempre READ-ONLY (inputs)
 * Não aceitam comandos, apenas reportam valores
 */

/**
 * Tipos de endpoint
 */
export type EndpointType = 'digital' | 'analog';
export type EndpointDirection = 'input' | 'output' | 'both';

/**
 * Endpoint físico de sensor (sempre input)
 */
export interface SensorEndpoint {
    name: string;           // 'default'
    controllerId: string;
    endpointName: string;   // Nome físico no CLP (AI0, AI1, DI0, etc)
    type: EndpointType;
    direction: EndpointDirection;  // Sempre 'input'
    value: number;
    min?: number;
    max?: number;
}

/**
 * Base para todos os sensores
 */
interface SensorBase {
    id: string;
    name: string;
    location?: string;
    isOnline: boolean;
    lastUpdate: Date;
    unit: string;           // Unidade de medida
}

/**
 * LIGHT SENSOR - Sensor de luminosidade
 * Mede intensidade de luz ambiente
 */
export interface LightSensor extends SensorBase {
    type: 'light_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint analógico input
    unit: 'lux' | '%' | 'cd/m²';
}

/**
 * TEMPERATURE SENSOR - Sensor de temperatura
 */
export interface TemperatureSensor extends SensorBase {
    type: 'temperature_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint analógico input
    unit: '°C' | '°F' | 'K';
}

/**
 * PRESSURE SENSOR - Sensor de pressão
 */
export interface PressureSensor extends SensorBase {
    type: 'pressure_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint analógico input
    unit: 'PSI' | 'bar' | 'Pa' | 'kPa';
}

/**
 * FLOW SENSOR - Sensor de fluxo
 */
export interface FlowSensor extends SensorBase {
    type: 'flow_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint analógico input
    unit: 'L/min' | 'L/h' | 'm³/h' | 'GPM';
}

/**
 * LEVEL SENSOR - Sensor de nível
 */
export interface LevelSensor extends SensorBase {
    type: 'level_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint analógico input
    unit: '%' | 'm' | 'cm' | 'mm' | 'ft';
}

/**
 * MOTION SENSOR - Sensor de movimento
 */
export interface MotionSensor extends SensorBase {
    type: 'motion_sensor';
    endpoint: SensorEndpoint;  // 1 endpoint digital input
    unit: 'boolean';  // 0 = no motion, 1 = motion detected
}

/**
 * Union type - qualquer tipo de sensor
 */
export type Sensor =
    | LightSensor
    | TemperatureSensor
    | PressureSensor
    | FlowSensor
    | LevelSensor
    | MotionSensor;

/**
 * DTO para criar sensor de luz
 */
export interface CreateLightSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
    unit: 'lux' | '%' | 'cd/m²';
    min?: number;
    max?: number;
}

/**
 * DTO para criar sensor de temperatura
 */
export interface CreateTemperatureSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
    unit: '°C' | '°F' | 'K';
    min?: number;
    max?: number;
}

/**
 * DTO para criar sensor de pressão
 */
export interface CreatePressureSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
    unit: 'PSI' | 'bar' | 'Pa' | 'kPa';
    min?: number;
    max?: number;
}

/**
 * DTO para criar sensor de fluxo
 */
export interface CreateFlowSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
    unit: 'L/min' | 'L/h' | 'm³/h' | 'GPM';
    min?: number;
    max?: number;
}

/**
 * DTO para criar sensor de nível
 */
export interface CreateLevelSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
    unit: '%' | 'm' | 'cm' | 'mm' | 'ft';
    min?: number;
    max?: number;
}

/**
 * DTO para criar sensor de movimento
 */
export interface CreateMotionSensorDTO {
    name: string;
    location?: string;
    controllerId: string;
    endpointName: string;
}

/**
 * Union type de DTOs
 */
export type CreateSensorDTO =
    | { type: 'light_sensor'; data: CreateLightSensorDTO }
    | { type: 'temperature_sensor'; data: CreateTemperatureSensorDTO }
    | { type: 'pressure_sensor'; data: CreatePressureSensorDTO }
    | { type: 'flow_sensor'; data: CreateFlowSensorDTO }
    | { type: 'level_sensor'; data: CreateLevelSensorDTO }
    | { type: 'motion_sensor'; data: CreateMotionSensorDTO };

/**
 * Response para API (fortemente tipado)
 */
export type SensorResponse =
    | {
        type: 'light_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: number;
        unit: 'lux' | '%' | 'cd/m²';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    }
    | {
        type: 'temperature_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: number;
        unit: '°C' | '°F' | 'K';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    }
    | {
        type: 'pressure_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: number;
        unit: 'PSI' | 'bar' | 'Pa' | 'kPa';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    }
    | {
        type: 'flow_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: number;
        unit: 'L/min' | 'L/h' | 'm³/h' | 'GPM';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    }
    | {
        type: 'level_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: number;
        unit: '%' | 'm' | 'cm' | 'mm' | 'ft';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    }
    | {
        type: 'motion_sensor';
        id: string;
        name: string;
        location?: string;
        isOnline: boolean;
        lastUpdate: string;
        value: 0 | 1;  // Motion detected
        unit: 'boolean';
        endpoint: {
            controllerId: string;
            endpointName: string;
        };
    };

/**
 * Type guards
 */
export function isLightSensor(sensor: Sensor): sensor is LightSensor {
    return sensor.type === 'light_sensor';
}

export function isTemperatureSensor(sensor: Sensor): sensor is TemperatureSensor {
    return sensor.type === 'temperature_sensor';
}

export function isPressureSensor(sensor: Sensor): sensor is PressureSensor {
    return sensor.type === 'pressure_sensor';
}

export function isFlowSensor(sensor: Sensor): sensor is FlowSensor {
    return sensor.type === 'flow_sensor';
}

export function isLevelSensor(sensor: Sensor): sensor is LevelSensor {
    return sensor.type === 'level_sensor';
}

export function isMotionSensor(sensor: Sensor): sensor is MotionSensor {
    return sensor.type === 'motion_sensor';
}
