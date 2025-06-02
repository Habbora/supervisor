import { SupervisorService } from "../../services";
import type { Light } from "../../services/light";


export async function handleList(supervisor: SupervisorService, args: string[]) {
  const lights = supervisor.lightService.getAllLights();
  console.log("\nLâmpadas encontradas:");
  lights.forEach((light: Light) => {
    console.log(`- name: ${light.name} device: ${light.lightEndpoint?.deviceName} output: ${light.lightEndpoint?.endpointName} type: ${light.lightEndpoint?.type} value: ${light.value}`);
  });
} 