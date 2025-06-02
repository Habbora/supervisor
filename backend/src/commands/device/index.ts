import { SupervisorService } from "../../services";
import { handleList } from "./list";
import { handleSetOutput } from "./setOutput";
import { handlePulseOutput } from "./pulseOutput";
import { handleAdd } from "./add";
import { handleRemove } from "./remove";
import { handleEndpoint } from "./endpoint";

export async function handleDeviceCommand(supervisor: SupervisorService, args: string[]) {
  const [command, ...newArgs] = args;

  switch (command.toLowerCase()) {
    case "list":
      await handleList(supervisor);
      break;
    case "add":
      await handleAdd(supervisor, newArgs);
      break;
    case "remove":
      await handleRemove(supervisor, newArgs);
      break;
    case "endpoint":
      await handleEndpoint(supervisor, newArgs);
      break;
    case "setoutput":
      await handleSetOutput(supervisor, newArgs);
      break;
    case "pulseoutput":
      await handlePulseOutput(supervisor, newArgs);
      break;
    default:
      console.error("Comando de dispositivo não reconhecido");
  }
} 