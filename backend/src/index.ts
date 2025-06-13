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

deviceManager.addDevice(new Level({
    id: "2",
    name: "Level2",
    type: "level",
    value: 0,
}));

deviceManager.addDevice(new Level({
    id: "3",
    name: "Level3",
    type: "level",
    value: 0,
}));

const controller = supervisor.deviceService.getDeviceByName("CLP1")!;

deviceManager.getDevice("1")?.addController(controller);
deviceManager.getDevice("2")?.addController(controller);
deviceManager.getDevice("3")?.addController(controller);

deviceManager.getDevice("1")?.addEndpoint("Teste", 0);
deviceManager.getDevice("2")?.addEndpoint("Teste2", 0);
deviceManager.getDevice("3")?.addEndpoint("Teste3", 0);

console.log("Device 1: ", deviceManager.getDevice("1")?.endpoints);
console.log("Device 2: ", deviceManager.getDevice("2")?.endpoints);
console.log("Device 3: ", deviceManager.getDevice("3")?.endpoints);

let value = 100;

setInterval(() => {
    value = value + 25;
    if (value > 100) value = 0;

    controller.emit("endpoint:Teste", {
        value: value,
        teste: "teste",
    });

    controller.emit("endpoint:Teste2", {
        value: value,
        teste: "teste",
    });

    controller.emit("endpoint:Teste3", {
        value: value,
        teste: "teste",
    });
}, 3000);