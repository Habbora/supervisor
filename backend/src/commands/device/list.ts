import { SupervisorService } from "../../services";
import { Device } from "../../services/devices/Device";

export async function handleList(supervisor: SupervisorService) {
  const devices = supervisor.deviceService.getAllDevices();
  console.log("\nDispositivos encontrados:");
  devices.forEach((device: Device) => {
    console.log(
      `- id: ${device.id} name: ${device.name} driver: ${device.driverName} host: ${device.startConfig?.host} port: ${device.startConfig?.port}`
    );
    console.log(`  - ${device.endpoints.map((endpoint) => endpoint.value).join(", ")}`);
  });
} 