import { SupervisorService } from "../../services";
import { Light } from "../../services/light";

export async function handleRemove(supervisor: SupervisorService, args: string[]) {
    if (args.length !== 1) {
        console.log("Uso: light remove <id>");
        console.log("\nArgumentos:");
        console.log("  id: ID da luz");
        console.log("  --force-id: (opcional) ID específico para a luz");
        console.log("\nExemplos:");
        console.log('  light remove "luz-sala-001"');
        return;
    }

    const [id] = args;

    try {
        supervisor.lightService.removeLight(id);
        console.log(`Luz "${id}" removida com sucesso!`);
    } catch (error: any) {
        console.error("Erro ao remover luz:", error.message);
    }
} 