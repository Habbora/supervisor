import { SupervisorService } from "../../services";
import { Device } from "../../services/devices/Device";
import type CreateDeviceDto from "../../services/devices/types/CreateDevice.dto";

export async function handleAdd(supervisor: SupervisorService, args: string[]) {
    const forceIdIndex = args.indexOf('--force-id');
    let id: string | undefined;

    if (forceIdIndex !== -1) {
        id = args[forceIdIndex + 1];
        args.splice(forceIdIndex, 2);
    }

    if (args.length < 2) {
        console.log("Uso: device add <nome> <driver> [--force-id <id>] [--config.<chave>=<valor> ...]");
        console.log("\nArgumentos:");
        console.log("  nome: Nome do dispositivo");
        console.log("  driver: Nome do driver (ex: modbus)");
        console.log("  --force-id: (opcional) ID específico para o dispositivo");
        console.log("  --config.<chave>: (opcional) Parâmetros de configuração do dispositivo");
        console.log("\nExemplos:");
        console.log("  device add MPC46A modbus --config.host=192.168.0.100 --config.port=502");
        console.log("  device add MPC46A modbus --config.host=192.168.0.100 --config.port=502 --force-id mpc46a-001");
        console.log("  device add Sensor1 serial --config.port=/dev/ttyUSB0 --config.baud=9600");
        return;
    }

    const [name, driverName] = args;
    const config: Record<string, any> = {};

    // Processa os parâmetros de configuração
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--config.')) {
            const [key, value] = arg.substring(9).split('=');
            if (key && value) {
                // Tenta converter para número se possível
                config[key] = isNaN(Number(value)) ? value : Number(value);
            }
        }
    }

    try {
        const deviceDto: CreateDeviceDto = {
            id,
            name,
            driverName,
            startConfig: config
        };

        const device = new Device(deviceDto);
        supervisor.deviceService.addDevice(device);
        console.log(`Dispositivo "${name}" adicionado com sucesso!`);
    } catch (error: any) {
        console.error("Erro ao adicionar dispositivo:", error.message);
    }
} 