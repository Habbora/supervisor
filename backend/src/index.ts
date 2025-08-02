import { Supervisor } from "./services/core/SupervisorService";

console.clear();

const supervisor = Supervisor.getInstance();

supervisor.historyManager.addDeviceHistory("levelInferior", "0");
supervisor.historyManager.addDeviceHistory("levelSuperior", "1");