import { Database } from "..";
import type { DeviceCreateSchema, DeviceSchema } from "./schema";

export class DeviceDatabase {
    private static instance: DeviceDatabase;

    private constructor() {
        this.initDatabase();
    }

    public static getInstance(): DeviceDatabase {
        if (!DeviceDatabase.instance) {
            DeviceDatabase.instance = new DeviceDatabase();
        }
        return DeviceDatabase.instance;
    }

    public initDatabase(): boolean {
        const database = Database.getInstance().readDatabase();
        if (!database.devices) Database.getInstance().writeDatabase({ ...database, devices: [] });
        return true;
    }

    public findAll(): DeviceSchema[] {
        const database = Database.getInstance().readDatabase();
        return database.devices;
    }

    public findById(id: string): DeviceSchema | undefined {
        const database = Database.getInstance().readDatabase();
        return database.devices.find((d: DeviceSchema) => d.id === id);
    }

    public create(device: DeviceCreateSchema): DeviceSchema | undefined {
        if (!device.name || !device.type || !device.endpoints) return undefined;

        const id = crypto.randomUUID();

        const database = Database.getInstance().readDatabase();
        database.devices.push({ ...device, id, inputs: [], outputs: [] });
        Database.getInstance().writeDatabase(database);

        return { ...device, id, inputs: [], outputs: [] };
    }

    public update(id: string, device: Partial<DeviceSchema>): DeviceSchema | undefined {
        const database = Database.getInstance().readDatabase();
        const oldDevice = this.findById(id);
        if (!oldDevice) return undefined;
        const newDevice = { ...oldDevice, ...device };
        database.devices = database.devices.map((d: DeviceSchema) => d.id === id ? newDevice : d);
        Database.getInstance().writeDatabase(database);

        console.log('Old device: ', oldDevice);
        console.log('New device: ', newDevice);

        return newDevice;
    }

    public delete(id: string): DeviceSchema | undefined {
        const oldDevice = this.findById(id);
        if (!oldDevice) return undefined;

        const database = Database.getInstance().readDatabase();
        database.devices = database.devices.filter((d: DeviceSchema) => d.id !== id);
        Database.getInstance().writeDatabase(database);

        return oldDevice;
    }
}