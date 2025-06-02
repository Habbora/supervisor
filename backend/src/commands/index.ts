import { SupervisorService } from "@/src/services";
import { handleDeviceCommand } from "./device";
import { handleLightCommand } from "./light";
import { showHelp } from "./help";

export async function processCommand(supervisor: SupervisorService, input: string) {
  const args = input.trim().split(" ");
  const [command, ...newArgs] = args;

  switch (command.toLowerCase()) {
    case "device":
      await handleDeviceCommand(supervisor, newArgs);
      break;

    case "light":
      await handleLightCommand(supervisor, newArgs);
      break;

    case "help":
      showHelp();
      break;

    case "exit":
      console.log("Encerrando supervisor...");
      await supervisor.destroy();
      process.exit(0);
      break;

    default:
      console.log("Comando não reconhecido. Use 'help' para ver os comandos disponíveis");
  }
} 