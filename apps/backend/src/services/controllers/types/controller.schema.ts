import { z } from "zod";

export const controllerSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    configs: z.any().optional(),
    status: z.any().optional(),
});

export type ControllerSchema = z.infer<typeof controllerSchema>;

export type ControllerCreateSchema = Omit<ControllerSchema, "id">;

export const controllerCreateSchema = controllerSchema.omit({ id: true });