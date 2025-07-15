import { SupervisorService } from "./services/core/SupervisorService";
import { DeviceManager } from "./services/devices/DeviceManager";
import { Level } from "./services/devices/Level";
import { Light } from "./services/devices/light";

console.clear();

const supervisor = new SupervisorService()
await supervisor.initialize();

const deviceManager = DeviceManager.getInstance();

const device = new Level({
    name: "Reservatorio Inferior",
    type: "level",
    value: 0,
    controller: "CLP1",
    endpoint: new Map([
        [0, "DO1"]
    ])
});

device.addController("CLP1");
device.addEndpoint("DO1", 0);

deviceManager.addDevice(device);

const device2 = new Light({
    name: "Luz de Emergencia",
    type: "light",
    controller: "CLP1",
    endpoint: new Map([
        [0, "DO1"]
    ])
});

deviceManager.addDevice(device2);