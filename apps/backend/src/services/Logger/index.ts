import { db, loggers } from "@/db";

const LOG_LEVELS = process.env.LOG_LEVELS || 'INFO';

export type Logger = {
    id: string,
    module: string,
    level: string,
    message: string,
    timestamp: Date
}

type CreateLoggerDTO = Omit<Logger, 'id' | 'timestamp'>

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
        return []
    }

    public async error(module: string, message: string) {
        if (this.logLevel > 1) return;
        const log = { module, level: 'ERROR', message, timestamp: Date.now() }
        console.error(`${log.timestamp} [${log.module}] [${log.level}] [${log.message}]`);
    }

    public async warn(module: string, message: string) {
        if (this.logLevel > 2) return;
        const log = { module, level: 'WARN', message, timestamp: Date.now() }
        console.warn(`${log.timestamp} [${log.module}] [${log.level}] [${log.message}]`);
    }

    public async info(module: string, message: string, color?: string) {
        if (this.logLevel > 3) return;
        const log = { module, level: 'INFO', message, timestamp: Date.now() }
        console.log(`${log.timestamp} (${log.module}) [${log.level}] ${this.colorLog(log.message, color)}`);
    }
}

export const logger = LoggerManager.getInstance();
