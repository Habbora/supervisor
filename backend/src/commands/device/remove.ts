import { SupervisorService } from "../../services";
import { Device } from "../../services/devices/Device";
import type CreateDeviceDto from "../../services/devices/types/CreateDevice.dto";

export async function handleRemove(supervisor: SupervisorService, args: string[]) {
    if (args.length !== 1) {
        console.log("Uso: device remove <id>");
        console.log("\nArgumentos:");
        console.log("  id: ID do dispositivo");
        console.log("\nExemplos:");
        console.log('  device remove "mpc46a-001"');
        return;
    }

    const [id] = args;

    try {
        supervisor.deviceService.removeDevice(id);
        console.log(`Dispositivo "${id}" removido com sucesso!`);
    } catch (error: any) {
        console.error("Erro ao remover dispositivo:", error.message);
    }
} 