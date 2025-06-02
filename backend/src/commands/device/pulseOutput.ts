import { SupervisorService } from "../../services";

export async function handlePulseOutput(supervisor: SupervisorService, args: string[]) {
  if (args.length !== 2) {
    console.log("Uso: device pulseOutput <deviceId> <outputName>");
    return;
  }
  try {
    const device = supervisor.deviceService.getDevice(args[0]);
    await device.setPulse(args[1]);
    console.log(`Pulso enviado para saída ${args[1]} do dispositivo ${args[0]}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erro ao controlar dispositivo: ${error.message}`);
    } else {
      console.error("Erro desconhecido ao controlar dispositivo");
    }
  }
} 