import { Controller } from "./services/controller/Controller";
import { Supervisor } from "./services/core/SupervisorService";
import { DeviceLevel } from "./services/devices/Level";
import { DevicePump } from "./services/devices/pump";

console.clear();

const supervisor = Supervisor.getInstance();

const controllerManager = supervisor.controllerManager;

const clp1 = new Controller({
    id: "0",
    name: "CLP1",
    driverName: "mcp46a",
    startConfig: {
        host: "10.1.1.240",
        port: 502
    }
});

const clp2 = new Controller({
    id: "1",
    name: "CLP2",
    driverName: "mcp17",
    startConfig: {
        host: "127.0.0.1",
        port: 502
    }
});

controllerManager.addDevice(clp1);
controllerManager.addDevice(clp2);

supervisor.historyManager.addDeviceHistory("levelInferior", "0");
supervisor.historyManager.addDeviceHistory("levelSuperior", "1");

const deviceManager = supervisor.deviceManager;

const levelInferior = new DeviceLevel({
    id: "0",
    name: "Reservatorio Inferior",
    type: "level",
    endpoint: new Map([
        [0, {
            type: "analog_input",
            controller: "CLP1",
            endpoint: "AI1"
        }]
    ])
});

const levelSuperior = new DeviceLevel({
    id: "1",
    name: "Reservatorio Superior",
    type: "level",
    endpoint: new Map([
        [0, {
            type: "analog_input",
            controller: "CLP1",
            endpoint: "AI2"
        }]
    ])
});

const pumpElev1 = new DevicePump({
    id: "2",
    name: "Bomba Elevatória 1",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO3"
        }]
    ])
});

const pumpElev2 = new DevicePump({
    id: "3",
    name: "Bomba Elevatória 2",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO4"
        }]
    ])
});

const levelPluvial = new DeviceLevel({
    id: "4",
    name: "Reservatorio Pluvial",
    type: "level",
    endpoint: new Map([
        [0, {
            type: "analog_input",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const pumpPluvial1 = new DevicePump({
    id: "5",
    name: "Bomba Pluvial 1",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const pumpPluvial2 = new DevicePump({
    id: "6",
    name: "Bomba Pluvial 2",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const levelSewage = new DeviceLevel({
    id: "7",
    name: "Reservatorio Esgoto",
    type: "level",
    endpoint: new Map([
        [0, {
            type: "analog_input",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const pumpSewage1 = new DevicePump({
    id: "8",
    name: "Bomba Esgoto 1",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const pumpSewage2 = new DevicePump({
    id: "9",
    name: "Bomba Esgoto 2",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

const pumpSewage3 = new DevicePump({
    id: "10",
    name: "Bomba Esgoto 3",
    type: "pump",
    endpoint: new Map([
        [0, {
            type: "digital_output",
            controller: "CLP1",
            endpoint: "DO1"
        }]
    ])
});

deviceManager.addDevice(levelPluvial);
deviceManager.addDevice(pumpPluvial1);
deviceManager.addDevice(pumpPluvial2);
deviceManager.addDevice(levelInferior);
deviceManager.addDevice(levelSuperior);
deviceManager.addDevice(pumpElev1);
deviceManager.addDevice(pumpElev2);
deviceManager.addDevice(levelSewage);
deviceManager.addDevice(pumpSewage1);
deviceManager.addDevice(pumpSewage2);
deviceManager.addDevice(pumpSewage3);

