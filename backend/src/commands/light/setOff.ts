import { SupervisorService } from "../../services";

export async function handleSetOff(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 1) {
    console.log("Uso: light setOff <lightId>");
    return;
  }
  try {
    const light = await supervisor.lightService.getLightByName(args[0]);
    if (!light) throw new Error("Lâmpada não encontrada");
    await light.setOff();
    console.log(`Comando executado: Desligar lâmpada ${args[0]}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao controlar lâmpada: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao controlar lâmpada");
    }
  }
} 