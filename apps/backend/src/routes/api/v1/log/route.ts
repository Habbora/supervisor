import { logger } from "@/services/Logger";

export const GET = async () => {
    const loggers = await logger.getAllLoggers();
    return Response.json(loggers);
}