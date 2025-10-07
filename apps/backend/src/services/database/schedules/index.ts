import { Database } from "..";
import type { ScheduleSchema } from "./schema";

export class ScheduleDatabase {
    private static instance: ScheduleDatabase;

    private constructor() {
        this.initDatabase();
    }

    public static getInstance(): ScheduleDatabase {
        if (!ScheduleDatabase.instance) {
            ScheduleDatabase.instance = new ScheduleDatabase();
        }
        return ScheduleDatabase.instance;
    }

    public initDatabase(): boolean {
        const database = Database.getInstance().readDatabase();
        if (!database.schedules) {
            database.schedules = [];
        }
        return true;
    }

    public findAll(): ScheduleSchema[] {
        const database = Database.getInstance().readDatabase();
        return database.schedules;
    }

    public findById(id: string): ScheduleSchema | undefined {
        const database = Database.getInstance().readDatabase();
        return database.schedules.find((schedule: ScheduleSchema) => schedule.id === id);
    }

    public addSchedule(schedule: ScheduleSchema): boolean {
        const database = Database.getInstance().readDatabase();
        database.schedules.push(schedule);
        Database.getInstance().writeDatabase(database);
        return true;
    }

    public updateSchedule(id: string, schedule: ScheduleSchema): boolean {
        const database = Database.getInstance().readDatabase();
        database.schedules = database.schedules.map((schedule: ScheduleSchema) => schedule.id === id ? schedule : schedule);
        Database.getInstance().writeDatabase(database);
        return true;
    }

    public removeSchedule(id: string): boolean {
        const database = Database.getInstance().readDatabase();
        database.schedules = database.schedules.filter((schedule: ScheduleSchema) => schedule.id !== id);
        Database.getInstance().writeDatabase(database);
        return true;
    }

    public removeAllSchedules(): boolean {
        const database = Database.getInstance().readDatabase();
        database.schedules = [];
        Database.getInstance().writeDatabase(database);
        return true;
    }
}
