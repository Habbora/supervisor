import { handleList } from "./list";
import { handleSetOn } from "./setOn";
import { handleSetOff } from "./setOff";
import { handleSetToggle } from "./setToggle";
import { handleAdd } from "./add";
import { SupervisorService } from "../../services";
import { handleRemove } from "./remove";

export async function handleLightCommand(supervisor: SupervisorService, args: string[]) {
  const [command, ...newArgs] = args;

  switch (command.toLowerCase()) {
    case "list":
      await handleList(supervisor, newArgs);
      break;
    case "add":
      await handleAdd(supervisor, newArgs);
      break;
    case "remove":
      await handleRemove(supervisor, newArgs);
      break;
    case "seton":
      await handleSetOn(supervisor, newArgs);
      break;
    case "setoff":
      await handleSetOff(supervisor, newArgs);
      break;
    case "settoggle":
      await handleSetToggle(supervisor, newArgs);
      break;
    default:
      console.log("Comando de lâmpada não reconhecido");
  }
} 