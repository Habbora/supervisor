import { SupervisorService } from "../../services";

export async function handleEndpoint(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 1) {
    return;
  } 
  try {
    const device = supervisor.deviceService.getDevice(args[0]);
    const endpoints = device?.endpoints;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao listar endpoints do dispositivo: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao listar endpoints do dispositivo");
    }
  }
} 