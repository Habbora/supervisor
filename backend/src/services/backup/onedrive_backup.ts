import { BaseService } from "../abstracts/BaseService";
import { HydraulicService } from "../hydraulic";
import * as fs from 'fs';
import * as path from 'path';

export class OneDriveBackupService extends BaseService {
    private hydraulicService: HydraulicService;
    private backupPath: string;
    private backupInterval: NodeJS.Timeout;
    protected logger: any;

    constructor() {
        super("OneDriveBackupService");
        this.hydraulicService = (global as any).hydraulicService;
        this.backupPath = process.env.ONEDRIVE_BACKUP_PATH || '/home/user/OneDrive/backups';
    }

    async backupHydraulicData(): Promise<void> {
        try {
            // Cria o diretório de backup se não existir
            if (!fs.existsSync(this.backupPath)) {
                fs.mkdirSync(this.backupPath, { recursive: true });
            }

            // Obtém os dados hidráulicos
            const hydraulicLevels = this.hydraulicService.getHydraulicLevels();

            // Cria o arquivo de backup
            const backupData = {
                timestamp: new Date().toISOString(),
                hydraulicLevels: hydraulicLevels
            };

            const backupFile = path.join(this.backupPath, `hydraulic_backup_${Date.now()}.json`);
            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

            this.logger.info(`Backup realizado com sucesso em: ${backupFile}`);
        } catch (error) {
            this.logger.error('Erro ao realizar backup:', error);
            throw error;
        }
    }

    async initialize(): Promise<this> {
        // Configura backup automático a cada 6 horas
        setInterval(() => {
            this.backupHydraulicData().catch(error => {
                this.logger.error('Erro no backup automático:', error);
            });
        }, 6 * 60 * 60 * 1000);

        return this;
    }

    async destroy(): Promise<void> {
        // Limpa o intervalo de backup
        clearInterval(this.backupInterval);
    }
} 