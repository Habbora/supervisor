import { LightService } from "./services";
import { SupervisorService } from "./services/core/SupervisorService";

const supervisor = new SupervisorService()
await supervisor.initialize();
