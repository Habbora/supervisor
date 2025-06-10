import { BaseService } from "../abstracts/BaseService";
import type { DeviceService } from "../controller";
import { HydraulicLevel, type HydraulicLevelDto } from "./hydraulic_level";

export class HydraulicService extends BaseService {
    private deviceService: DeviceService = (global as any).deviceService;

    private hydraulicLevels: Map<string, HydraulicLevel> = new Map();

    constructor() {
        super("HydraulicService");
        this.hydraulicLevels.set("1", new HydraulicLevel({
            id: "1",
            name: "Nivel 1",
            value: 100
        }));
        this.hydraulicLevels.set("2", new HydraulicLevel({
            id: "2",
            name: "Nivel 2",
            value: 90
        }));
        this.hydraulicLevels.set("3", new HydraulicLevel({
            id: "3",
            name: "Nivel 3",
            value: 85
        }));
    }

    async createHydraulicLevel(dto: HydraulicLevelDto): Promise<HydraulicLevel> {
        const level = new HydraulicLevel(dto);
        this.hydraulicLevels.set(level.id, level);
        return level;
    }

    getHydraulicLevels(): HydraulicLevel[] {
        return Array.from(this.hydraulicLevels.values());
    }

    async setOpen(deviceName: string): Promise<void> {
        const device = this.deviceService.getDeviceByName(deviceName);
        if (!device) throw new Error("Device not found");
        device.setOutput("0", 1);
        return;
    }

    async setClose(deviceName: string): Promise<void> {
        return;
    }

    async setToggle(deviceName: string): Promise<void> {
        return;
    }

    private saveClass() {

    }

    private loadClass() {

    }

    async initialize(): Promise<this> {
        return this;
    }

    async destroy(): Promise<void> {
        return;
    }
}



