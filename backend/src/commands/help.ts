import { mainCommands, deviceCommands, lightCommands } from "./availableCommands";
import { SupervisorService } from "../services/core/SupervisorService";

export function showHelp() {
  console.log("\nComandos disponíveis:");

  // Mostra comandos principais
  console.log("\nComandos principais:");
  mainCommands.forEach((cmd) => {
    console.log(`- ${cmd.name}: ${cmd.description}`);
  });

  // Mostra comandos de dispositivo
  console.log("\nComandos de dispositivo:");
  deviceCommands.forEach((cmd) => {
    const usage = cmd.usage ? ` ${cmd.usage}` : "";
    console.log(`- device ${cmd.name}${usage}: ${cmd.description}`);
  });

  // Mostra comandos de luz
  console.log("\nComandos de luz:");
  lightCommands.forEach((cmd) => {
    const usage = cmd.usage ? ` ${cmd.usage}` : "";
    console.log(`- light ${cmd.name}${usage}: ${cmd.description}`);
  });

  console.log("\n");
} 