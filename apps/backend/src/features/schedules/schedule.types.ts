import { z } from "zod";

export const createScheduleDto = z.object({
    name: z.string(),
    time: z.object({
        hour: z.number(),
        minute: z.number(),
    }),
    actions: z.array(z.object({
        deviceId: z.string(),
        action: z.string(),
        value: z.number(),
    })).default([]),
});

export type CreateScheduleDto = z.infer<typeof createScheduleDto>;
