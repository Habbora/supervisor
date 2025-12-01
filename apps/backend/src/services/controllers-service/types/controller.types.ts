import type { Controller } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const ENDPOINT_TYPES = [
    'digital_output',
    'digital_input',
    'analog_input',
    'analog_output'
] as const;
export type EndpointType = typeof ENDPOINT_TYPES[number];

// ═══════════════════════════════════════════════════════════════════
// CONFIG TYPES
// ═══════════════════════════════════════════════════════════════════

export type EndpointConfig = {
    address?: number;
    function?: number;
    dataType?: string;
    scale?: number;
    offset?: number;
    topic?: string;
    path?: string;
    method?: string;
    [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════
// DTOs (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════════

export type CreateControllerDTO = {
    name: string
    driver: string
}

export type UpdateControllerDTO = {
    name?: string;
    configs?: any;
    tags?: any;
}

export type CreateEndpointDTO = {
    name: string;
    type: EndpointType;
    controllerId: string;
    configs?: EndpointConfig;
    description?: string;
    unit?: string;
}

export type UpdateEndpointDTO = {
    name?: string;
    type?: EndpointType;
    configs?: EndpointConfig;
    description?: string;
    unit?: string;
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ControllerWithEndpoints extends Controller {
    // endpoints: EndpointController[];
}

// Status do controller
export interface ControllerStatus {
    isConnected: boolean;
    lastSeen?: Date | null;
}
