import { SupervisorService } from "../../services";

export async function handleSetToggle(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 1) {
    console.log("Uso: light setToggle <lightId>");
    return;
  }
  try {
    const light = await supervisor.lightService.getLightByName(args[0]);
    if (!light) {
      console.error(`Lâmpada ${args[0]} não encontrada`);
      return;
    }
    light.setToggle();
    console.log(`Estado da lâmpada ${args[0]} alternado`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao controlar lâmpada: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao controlar lâmpada");
    }
  }
} 