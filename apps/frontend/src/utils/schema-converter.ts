import { z } from "zod";

export interface JsonSchemaProperty {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';
    title?: string;
    description?: string;
    default?: any;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
    format?: string;
}

export interface JsonSchema {
    type: 'object';
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
    additionalProperties?: boolean;
}

export interface UiMetadata {
    mode?: string;
    label?: string;
    placeholder?: string;
    description?: string;
}

export const extractUiMetadata = (description?: string): UiMetadata => {
    if (!description) return {};
    try {
        // Try to parse description as JSON
        const parsed = JSON.parse(description);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch (e) {
        // Not JSON, return as plain description
    }
    return { description };
};

export const generateZodSchema = (schema: JsonSchema) => {

    if (!schema || schema.type !== 'object' || !schema.properties) {
        return z.any();
    }

    const shape: Record<string, z.ZodTypeAny> = {};

    Object.entries(schema.properties).forEach(([key, prop]) => {
        let validator: z.ZodTypeAny;

        switch (prop.type) {
            case 'integer':

            case 'number':
                validator = z.number({ message: "Deve ser um número" });
                if (prop.minimum !== undefined) validator = (validator as z.ZodNumber).min(prop.minimum, `Mínimo: ${prop.minimum}`);
                if (prop.maximum !== undefined) validator = (validator as z.ZodNumber).max(prop.maximum, `Máximo: ${prop.maximum}`);
                break;

            case 'boolean':
                validator = z.boolean();
                break;

            case 'string':
            default:
                validator = z.string();
                if (prop.format === 'ipv4') {
                    validator = (validator as z.ZodString)
                }
                if (prop.pattern) {
                    validator = (validator as z.ZodString).regex(new RegExp(prop.pattern), "Formato inválido");
                }
                if (prop.minLength !== undefined) {
                    validator = (validator as z.ZodString).min(prop.minLength, `Mínimo de ${prop.minLength} caracteres`);
                }
                if (prop.maxLength !== undefined) {
                    validator = (validator as z.ZodString).max(prop.maxLength, `Máximo de ${prop.maxLength} caracteres`);
                }
                break;
        }

        // Handle enums (selects)
        if (prop.enum) {
            const values = prop.enum;
            validator = validator.refine((val) => values.includes(val), {
                message: "Valor inválido"
            });
        }

        // Handle optional/required
        const isRequired = schema.required?.includes(key);
        if (!isRequired) {
            validator = validator.optional().or(z.literal(''));
        }

        // Handle default
        if (prop.default !== undefined) {
            validator = validator.default(prop.default);
        }

        shape[key] = validator;
    });

    return z.object(shape);
};
