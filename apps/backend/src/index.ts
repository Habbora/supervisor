import { logger } from "./services/Logger/index.ts";
import { createServer } from "./server";
import { ControllerManager } from "./controllers/controller.manager.ts";
import { ModbusTCPClientDriver } from "./controllers/drivers/modbus_tcp_client.driver.ts";
import { ControllerBootstrap } from "./controllers/controller.bootstrap.ts";

await logger.info('app', 'Carregando os Controladores...', 'cyan');
ControllerManager.getInstance()
    .registerDriver('modbus_tcp_client', {
        name: 'Modbus TCP Client',
        description: 'Modbus TCP Client',
        factory: (config: any) => new ModbusTCPClientDriver(config)
    })

await ControllerBootstrap.loadFromDatabase()
logger.info('app', 'Controladores carregados', 'green');

// Iniciando o servidor HTTP com Elysia.
await logger.info('app', 'Iniciando servidor HTTP com Elysia...', 'cyan');
createServer().listen(4000, () => {
    logger.info('app', 'Servidor HTTP iniciado na porta 4000', 'green');
})
