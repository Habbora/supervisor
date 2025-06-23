import { SupervisorService } from "./services/core/SupervisorService";
import { Level } from "./services/devices/level";
import { DeviceManager } from "./services/devices/manager";

console.clear();

const supervisor = new SupervisorService()
await supervisor.initialize();

const deviceManager = (global as any).deviceManager as DeviceManager;



deviceManager.addDevice(new Level({
    id: "1",
    name: "Reservatorio Inferior",
    type: "level",
    controller: supervisor.deviceService.getDeviceByName("CLP1"),
    endpoint: new Map([
        [0, "DO1"]
    ])
}));

deviceManager.addDevice(new Level({
    id: "2",
    name: "Reservatorio Superior",
    type: "level",
    controller: supervisor.deviceService.getDeviceByName("CLP1"),
    endpoint: new Map([
        [0, "DO1"]
    ])
}));

console.log(deviceManager.getDevices());
