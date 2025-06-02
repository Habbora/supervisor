import fs from 'fs';
import path from 'path';

export class LoggerService {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.logFile = path.join(this.logDir, `supervisor_${new Date().toISOString().split('T')[0]}.log`);
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private stringBuilder(command: string, message: string, arg?: string): string {
    return `${new Date().toISOString()} [${command}] ${message}${arg ? ` ${":" + arg}` : ''}\n`;
  }

  logCommand(command: string, message: string) {
    const filePath = path.join(this.logDir, 'commands.log');  
    const logMessage = this.stringBuilder('COMMAND', command, message);
    fs.appendFileSync(filePath, logMessage);
  }

  logInfo(message: string) {
    const filePath = path.join(this.logDir, 'info.log');
    const logMessage = this.stringBuilder('INFO', message);
    fs.appendFileSync(filePath, logMessage);
  }

  logError(message: string) {
    const filePath = path.join(this.logDir, 'error.log');
    const logMessage = this.stringBuilder('ERROR', message);
    fs.appendFileSync(filePath, logMessage);
  }
}