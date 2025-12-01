import { z } from "zod";

// Ter mais types assim que no banco de dados - Pf eu adoraria

export const createScheduleDto = z.object({
    name: z.string(),
    time: z.object({
        hour: z.number().min(0, 'Hora não pode ser menor que 0').max(23, 'Hora não pode ser maior que 23'),
        minute: z.number().min(0, 'Minuto não pode ser menor que 0').max(59, 'Minuto não pode ser maior que 59'),
    }),
    isActive: z.boolean().optional().default(true),
    recurrenceType: z.enum(['once', 'daily', 'weekly']).optional().default('daily'),
    recurrenceConfig: z.object({
        weekdays: z.array(z.number().min(0).max(6)).optional()
    }).optional(),
    actions: z.array(z.object({
        deviceId: z.string(),
        action: z.string(),
        value: z.number(),
    })).min(1, "Pelo menos uma ação é obrigatória"),
});

export type CreateScheduleDto = z.infer<typeof createScheduleDto>;
