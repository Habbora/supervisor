import { z } from "zod";

export const Endpoint = z.object({
    name: z.string(),
    controllerId: z.uuidv4(),
    endpointName: z.string(),
});
export type Endpoint = z.infer<typeof Endpoint>;

export const Variable = z.object({
    name: z.string(),
    type: z.enum(["string", "number", "boolean"]),
    value: z.any(),
});
export type Variable = z.infer<typeof Variable>;

export const DeviceType = z.enum(["level", "light", "pump", "valve", "other"]);
export type DeviceType = z.infer<typeof DeviceType>;

export const DeviceResponse = z.object({
    id: z.uuidv4(),
    name: z.string().min(3).max(30),
    type: DeviceType,
    value: z.number().min(-1).max(100).default(-1),
    endpoints: z.array(Endpoint),
    inputs: z.array(Variable),
    outputs: z.array(Variable),
});
export type DeviceResponse = z.infer<typeof DeviceResponse>;

export const DeviceDto = z.object({
    id: z.uuidv4().optional(),
    name: z.string().min(3).max(30),
    type: DeviceType,
    endpoints: z.array(Endpoint),
    inputs: z.array(Variable),
    outputs: z.array(Variable),
});
export type DeviceDto = z.infer<typeof DeviceDto>;

export const DevicePatchDto = z.object({
    name: z.string().min(3).max(30).optional(),
    type: DeviceType.optional(),
    endpoints: z.array(Endpoint).optional(),
    inputs: z.array(Variable).optional(),
    outputs: z.array(Variable).optional(),
});
export type DevicePatchDto = z.infer<typeof DevicePatchDto>;