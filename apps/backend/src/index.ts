import { Database } from "./services/database";
import { ControllerManager } from "./services/controllers/manager";
import { Dashboard } from "./services/dashboard";
import { DeviceService } from "./services/devices/DeviceService";
import { EventBus } from "./services/event-bus/index.ts";
import { HistoryManager } from "./services/History/index.ts";
import { ScheduleManager } from "./features/schedules/schedule-manager.ts";
import { database } from "./database";
import { logger } from "./services/Logger/index.ts";

function createBanner() {
    const banner = `
╔══════════════════════════════════════════════════════════════╗
║    SUPERVISOR BACKEND                                        ║
║    v1.0.0                                                    ║
║                                                              ║
║    Sistema de Supervisão Industrial                          ║
║    Monitoramento e Controle de Dispositivos                  ║
║    Powered by Bun Runtime                                    ║
╚══════════════════════════════════════════════════════════════╝
`;
    return banner;
}

function logEnvironment() {
    const banner = `
┌──────────────────────────────────────────────────────────────┐
│    CONFIGURAÇÕES DO AMBIENTE:                                │
│      - NODE_ENV: ${process.env.NODE_ENV || 'Não configurado'}│
│      - DATABASE: ${process.env.DATABASE_URL || 'Não configurada'}│
│      - JWT_SECRET: ${process.env.JWT_SECRET || 'Não configurado'}│
└──────────────────────────────────────────────────────────────┘
`;
    return banner;
}

console.clear();
console.log(createBanner());
console.log(logEnvironment());

const startTime = Date.now();

try {
    logger.info('app', 'Iniciando sistema...', 'cyan');
    logger.info('app', 'Conectando ao banco de dados SQLite...', 'cyan');
    await database;
    logger.info('app', 'Banco de dados SQLite conectado', 'green');

    logger.info('app', 'Conectando ao banco de dados...', 'cyan');
    Database.getInstance();
    logger.info('app', 'Banco de dados conectado', 'green');

    logger.info('app', 'Inicializando EventBus...', 'cyan');
    EventBus.getInstance();
    logger.info('app', 'EventBus inicializado', 'green');

    logger.info('app', 'Configurando HistoryManager...', 'cyan');
    HistoryManager.getInstance();
    logger.info('app', 'HistoryManager configurado', 'green');

    logger.info('app', 'Carregando ControllerManager...', 'cyan');
    ControllerManager.getInstance();
    logger.info('app', 'ControllerManager carregado', 'green');

    logger.info('app', 'Configurando DeviceService...', 'cyan');
    DeviceService.getInstance();
    logger.info('app', 'DeviceService configurado', 'green');

    logger.info('app', 'Inicializando ScheduleManager...', 'cyan');
    ScheduleManager.getInstance();
    logger.info('app', 'ScheduleManager inicializado', 'green');

    logger.info('app', 'Configurando Dashboard...', 'cyan');
    Dashboard.getInstance();
    logger.info('app', 'Dashboard configurado', 'green');

} catch (error) {
    logger.error('app', `Erro durante inicialização: ${error}`);
    process.exit(1);
}

const endTime = Date.now();
const duration = endTime - startTime;
logger.info('app', `Sistema inicializado em ${duration}ms`, 'green');
