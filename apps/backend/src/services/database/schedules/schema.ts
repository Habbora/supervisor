import { z } from "zod";

export const scheduleSchema = z.object({
    id: z.string(),
    name: z.string(),
    time: z.object({
        hour: z.number(),
        minute: z.number(),
    }),
    nextExecution: z.coerce.date().optional(),
    lastExecution: z.coerce.date().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deletedAt: z.coerce.date().optional().nullable(),
    actions: z.array(z.object({
        deviceId: z.string(),
        action: z.string(),
        value: z.number(),
    })).default([]),
});

export type ScheduleSchema = z.infer<typeof scheduleSchema>;