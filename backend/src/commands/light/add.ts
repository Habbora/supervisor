import { SupervisorService } from "../../services";
import type { CreateLightDto } from "../../services/light/types/CreateLight.dto";

export async function handleAdd(supervisor: SupervisorService, args: string[]) {
    const forceIdIndex = args.indexOf('--force-id');
    let id: string | undefined;

    if (forceIdIndex !== -1) {
        id = args[forceIdIndex + 1];
        args.splice(forceIdIndex, 2);
    }

    if (args.length !== 3) {
        console.log("Uso: light add <nome> <deviceId> <endpointId> [--force-id <id>]");
        console.log("\nArgumentos:");
        console.log("  nome: Nome da luz");
        console.log("  deviceId: ID do dispositivo");
        console.log("  endpointId: ID do endpoint do dispositivo");
        console.log("  --force-id: (opcional) ID específico para a luz");
        console.log("\nExemplos:");
        console.log('  light add "Luz da Sala" "mpc46a-001" "1"');
        console.log('  light add "Luz da Sala" "mpc46a-001" "1" --force-id luz-sala-001');
        return;
    }

    const [name, deviceId, endpointId] = args;

    try {
        // Verifica se o device existe
        supervisor.deviceService.getDevice(deviceId);

        const dto: CreateLightDto = {
            id,
            name,
            deviceId,
            endpointId,
            isOn: false
        };

        await supervisor.lightService.createLight(dto);
        console.log(`Luz "${name}" adicionada com sucesso!`);
    } catch (error: any) {
        console.error("Erro ao adicionar luz:", error.message);
    }
} 