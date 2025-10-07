import { z } from "zod";

export const controllerEndpoint = z.object({
    name: z.string(),
    address: z.number(),
    value: z.number().optional(),
    type: z.enum(["input", "output"]).optional(),
});

export type ControllerEndpoint = z.infer<typeof controllerEndpoint>;