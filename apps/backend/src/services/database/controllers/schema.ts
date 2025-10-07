import { z } from "zod";

const controllerSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    configs: z.any().optional(),
});

export type ControllerSchema = z.infer<typeof controllerSchema>;

export type CreateControllerSchema = Omit<ControllerSchema, "id">;