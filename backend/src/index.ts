import { SupervisorService } from "./services/core/SupervisorService";
import { Level } from "./services/devices/level";

const supervisor = new SupervisorService()
await supervisor.initialize();

const deviceManager = (global as any).deviceManager;
deviceManager.addDevice(new Level({
    id: "1",
    name: "Level",
    type: "level",
    value: 75,
}));

const controller = supervisor.deviceService.getDeviceByName("CLP1")!;
deviceManager.getDevice("1")?.addController({
    controller,
    endpoint: "Teste",
});

controller.emit("endpoint:Teste", {
    value: 100,
    teste: "teste",
});