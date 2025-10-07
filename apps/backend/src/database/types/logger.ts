import { z } from "zod";

export const Logger = z.object({
    id: z.number().int().positive(),
    module: z.string(),
    level: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']),
    message: z.string(),
    timestamp: z.coerce.date(),
});

export type Logger = z.infer<typeof Logger>;

export const CreateLogger = Logger.omit({ id: true, timestamp: true });

export type CreateLogger = z.infer<typeof CreateLogger>;