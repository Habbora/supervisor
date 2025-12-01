/**
 * SENSORS FEATURE - Barrel Export
 *
 * Exporta tudo relacionado a sensores (READ-ONLY) em um único ponto
 */

export { SensorDevice } from './Sensor';
export { SensorService } from './SensorService';
export { sensorRoutes } from './sensor.routes';

export type {
    Sensor,
    LightSensor,
    TemperatureSensor,
    PressureSensor,
    FlowSensor,
    LevelSensor,
    MotionSensor,
    SensorEndpoint,
    SensorResponse,
    CreateSensorDTO,
    CreateLightSensorDTO,
    CreateTemperatureSensorDTO,
    CreatePressureSensorDTO,
    CreateFlowSensorDTO,
    CreateLevelSensorDTO,
    CreateMotionSensorDTO,
    EndpointType,
    EndpointDirection
} from './sensor.types';

export {
    isLightSensor,
    isTemperatureSensor,
    isPressureSensor,
    isFlowSensor,
    isLevelSensor,
    isMotionSensor
} from './sensor.types';
