import { SupervisorService } from "./services/core/SupervisorService";

console.clear();

const supervisor = new SupervisorService()
await supervisor.initialize();
