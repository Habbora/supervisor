import { DeviceHistory } from "./device_history";

export class HistoryManager {
    private static instance: HistoryManager;
    private history: Map<string, DeviceHistory> = new Map();

    constructor() {
        this.history = new Map<string, DeviceHistory>();
    }

    public static getInstance() {
        if (!HistoryManager.instance) {
            HistoryManager.instance = new HistoryManager();
        }
        return HistoryManager.instance;
    }

    public addDeviceHistory(name: string, deviceName: string) {
        this.history.set(name, new DeviceHistory(deviceName));
    }

    public getDeviceHistory(name: string) {
        return this.history.get(name);
    }
}

export const history = HistoryManager.getInstance();