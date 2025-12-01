/**
 * LIGHTS FEATURE - Barrel Export
 *
 * Exporta tudo relacionado a lâmpadas (ATUADORES apenas)
 * Sensores movidos para features/sensors/
 */

export { LightDevice } from './Light';
export { LightService } from './LightService';
export { lightRoutes } from './light.routes';

export type {
    Light,
    LightSwitch,
    LightDimmer,
    LightEndpoint,
    LightCommand,
    LightResponse,
    CreateLightDTO,
    CreateLightSwitchDTO,
    CreateLightDimmerDTO,
    EndpointType,
    EndpointDirection
} from './light.types';

export {
    isLightSwitch,
    isLightDimmer
} from './light.types';
