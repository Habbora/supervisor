import { BaseService } from "../abstracts/BaseService";
import type { DeviceService } from "../devices";
import type { HydraulicLevel, HydraulicLevelDto } from "./hydraulic_level";




export class HydraulicService extends BaseService {
    private deviceService: DeviceService = (global as any).deviceService;

    private hydraulicLevels: Map<string, HydraulicLevel> = new Map();

    constructor() {
        super("HydraulicService");
    }

    async createHydraulicLevel(dto: HydraulicLevelDto): Promise<HydraulicLevel> {
        const level = new HydraulicLevel(dto);
        this.hydraulicLevels.set(level.id, level);
        return level;
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



