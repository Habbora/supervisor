import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════
// CONFIG TYPES
// ═══════════════════════════════════════════════════════════════════

export type ControllerConfig = Record<string, any>;

// ═══════════════════════════════════════════════════════════════════
// ENTITIES
// ═══════════════════════════════════════════════════════════════════

export type Tag = {
    id: string;
    name: string;
    type: string;
    configs?: string;
    description?: string;
    unit?: string;
    controllerId: string;
    createdAt: string;
    updatedAt: string;
}

export type ControllerType = {
    id: string;
    name: string;
    tags: Tag[];
    driver: string;
    configs?: ControllerConfig;
    status: {
        isConnected: boolean;
    }
    createdAt: string;
    updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════
// DTOs (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════════

export type CreateControllerDTO = {
    name: string;
    driver: string;
}

export interface UpdateControllerDTO {
    name?: string;
    driver?: string;
    configs?: ControllerConfig;
    isConnected?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// ZOD SCHEMAS
// ═══════════════════════════════════════════════════════════════════

export const CreateControllerSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
    type: z.enum(['modbus', 'mqtt', 'http', 'websocket']),
    configs: z.record(z.any(), z.any()).optional()
});

export const CreateTagSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
    type: z.enum(['digital_output', 'digital_input', 'analog_input', 'analog_output']),
    configs: z.record(z.any(), z.any()).optional(),
    description: z.string().optional(),
    unit: z.string().optional()
});