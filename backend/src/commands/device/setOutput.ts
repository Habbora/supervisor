import { SupervisorService } from "../../services";

export async function handleSetOutput(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 3) {
    console.log("Uso: device setOutput <deviceId> <outputName> <value>");
    return;
  }
  try {
    const device = supervisor.deviceService.getDevice(args[0]);
    await device.setOutput(args[1], parseInt(args[2]));
    console.log(`Saída ${args[1]} do dispositivo ${args[0]} definida para ${args[2]}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao controlar dispositivo: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao controlar dispositivo");
    }
  }
} 