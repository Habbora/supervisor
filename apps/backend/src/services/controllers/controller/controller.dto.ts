import { z } from "zod";

export const controllerResponseDTO = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    status: z.object({
        isEnabled: z.boolean().default(false),
        isRunning: z.boolean().default(false),
        isConnected: z.boolean().default(false),
    }),
    configs: z.object({
        network: z.object({
            host: z.ipv4(),
            port: z.number(),
        }).optional(),
    }).optional(),
    endpoints: z.array(z.object({
        name: z.string(),
        address: z.number(),
        type: z.string(),
    })).default([]),
});

export type ControllerResponseDTO = z.infer<typeof controllerResponseDTO>;

export const CreateControllerInstace = z.object({
    id: z.string(),
    name: z.string(),
    driverId: z.string()
});

export type CreateControllerInstace = z.infer<typeof CreateControllerInstace>;
