import { LoggerRepository } from "../repositories/LoggerRepository";
import { CreateLogger, type Logger } from "../types/logger";

export class LoggerService {
    private loggerRepository: LoggerRepository;

    constructor() {
        this.loggerRepository = new LoggerRepository();
    }

    public async createLogger(loggerData: CreateLogger): Promise<Logger> {
        const validatedLoggerData = CreateLogger.parse(loggerData);
        return this.loggerRepository.create(validatedLoggerData);
    }

    public async getAllLoggers(): Promise<Logger[]> {
        return this.loggerRepository.findAll();
    }
}   