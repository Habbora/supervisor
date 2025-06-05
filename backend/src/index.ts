import { SupervisorService } from "./services/core/SupervisorService";

const supervisor = new SupervisorService()
await supervisor.initialize();

setInterval(async () => {
  console.log(supervisor.lightService.getLightByName("Circuito 1 CLP1")?.value);
}, 3000);

