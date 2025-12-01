/**
 * TIPOS DE LÂMPADAS - SIMPLIFICADO
 *
 * Apenas Light Switch (on/off)
 */

/**
 * Light - apenas switch on/off
 */
export interface Light {
    id: string;
    name: string;
    isOnline: boolean;
    lastUpdate: Date;
    controllerId: string;
    endpointName: string;  // Nome físico no CLP (Q0.0, etc)
    value: number;         // 0 ou 1
}

/**
 * DTO para criar lâmpada
 */
export type CreateLightDTO = {
    name: string;
    controllerId: string;
    endpointName: string;
}

/**
 * Comandos para lâmpadas
 */
export type LightCommand = {
    action: 'turnOn' | 'turnOff' | 'toggle';
}

/**
 * Response para API
 */
export type LightResponse = {
    id: string;
    name: string;
    isOnline: boolean;
    lastUpdate: string;
    value: 0 | 1;
    controllerId: string;
    endpointName: string;
}
