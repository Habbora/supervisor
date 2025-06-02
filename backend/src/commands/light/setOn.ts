import { SupervisorService } from "../../services";

export async function handleSetOn(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 1) {
    console.log("Uso: light setOn <lightId>");
    return;
  }
  try {
    const light = await supervisor.lightService.getLightByName(args[0]);
    if (!light) throw new Error("Lâmpada não encontrada");
    await light.setOn();
    console.log(`Comando executado: Ligar lâmpada ${args[0]}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao controlar lâmpada: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao controlar lâmpada");
    }
  }
} 