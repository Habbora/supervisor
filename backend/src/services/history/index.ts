import { DeviceHistory } from "./device_history";

export class HistoryManager {
    private static __instance: HistoryManager;
    private __history: Map<string, DeviceHistory> = new Map();

    constructor() {
        this.__history = new Map<string, DeviceHistory>();
    }

    public static getInstance() {
        if (!HistoryManager.__instance) {
            HistoryManager.__instance = new HistoryManager();
        }
        return HistoryManager.__instance;
    }

    public addDeviceHistory(name: string, deviceName: string) {
        this.__history.set(name, new DeviceHistory(deviceName));
    }

    public getDeviceHistory(name: string) {
        return this.__history.get(name);
    }
}