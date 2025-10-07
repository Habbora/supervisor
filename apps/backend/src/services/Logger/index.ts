import { database } from "@/database";
import type { Logger } from "@/database/types/logger";

const LOG_LEVELS = process.env.LOG_LEVELS || 'INFO';

export class LoggerManager {
    private static instance: LoggerManager;
    private logLevel: number;

    private constructor() {
        switch (LOG_LEVELS) {
            case 'ERROR': this.logLevel = 1; break;
            case 'WARN': this.logLevel = 2; break;
            case 'INFO': this.logLevel = 3; break;
            case 'DEBUG': this.logLevel = 4; break;
            case 'TRACE': this.logLevel = 5; break;
            default: this.logLevel = 3; break;
        }
    }

    private colorLog(message: string, color?: string) {
        const colors = {
            cyan: '\x1b[36m',   // Cyan
            green: '\x1b[32m',  // Green
            red: '\x1b[31m',    // Red
            yellow: '\x1b[33m', // Yellow
            blue: '\x1b[34m',   // Blue
            magenta: '\x1b[35m' // Magenta
        }

        const reset = '\x1b[0m';

        if (color) return `${colors[color as keyof typeof colors]}${message}${reset}`;
        return message;
    }

    public static getInstance(): LoggerManager {
        if (!LoggerManager.instance) {
            LoggerManager.instance = new LoggerManager();
        }
        return LoggerManager.instance;
    }

    public async getAllLoggers(): Promise<Logger[]> {
        return await database.loggerService.getAllLoggers();
    }

    public async error(module: string, message: string) {
        if (this.logLevel > 1) return;
        const log = await database.loggerService.createLogger({ module, message, level: 'ERROR' });
        console.error(`${log.timestamp} [${log.module}] [${log.level}] [${log.message}]`);
    }

    public async warn(module: string, message: string) {
        if (this.logLevel > 2) return;
        const log = await database.loggerService.createLogger({ module, message, level: 'WARN' });
        console.warn(`${log.timestamp} [${log.module}] [${log.level}] [${log.message}]`);
    }

    public async info(module: string, message: string, color?: string) {
        if (this.logLevel > 3) return;
        const log = await database.loggerService.createLogger({ module, message, level: 'INFO' });
        console.log(`${log.timestamp} (${log.module}) [${log.level}] ${this.colorLog(log.message, color)}`);
    }
}

export const logger = LoggerManager.getInstance();