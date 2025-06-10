import { SupervisorService } from "./services/core/SupervisorService";
import { Level } from "./services/devices/level";

const supervisor = new SupervisorService()
await supervisor.initialize();

const device = new Level({
    id: "1",
    name: "Level",
    value: 0,
});

device.setController({
    controller: supervisor.deviceService.getDeviceByName("CLP1")!,
    endpoint: "Teste",
});

supervisor.deviceService.getDeviceByName("CLP1")!.emit("endpoint:Teste", {
    value: 100,
    teste: "teste",
});

device.removeController();

supervisor.deviceService.getDeviceByName("CLP1")!.emit("endpoint:Teste", {
    value: 100,
    teste: "teste",
});
