import { ScheduleDatabase } from "@/services/database/schedules";
import { Schedule } from "./schedule";
import { createScheduleDto, type CreateScheduleDto } from "./schedule.types";

export class ScheduleManager {
    private static __instance: ScheduleManager;
    private __schedules: Map<string, Schedule> = new Map();

    constructor() {
        this.loadSchedules();
    }

    public static getInstance() {
        if (!ScheduleManager.__instance) {
            ScheduleManager.__instance = new ScheduleManager();
        }
        return ScheduleManager.__instance;
    }

    private loadSchedules() {
        const schedules = ScheduleDatabase.getInstance().findAll();
        schedules.forEach((schedule) => {
            const tempSchedule = Schedule.fromDatabase(schedule);
            this.__schedules.set(schedule.id, tempSchedule);
        });
    }

    public create(dto: CreateScheduleDto) {
        const validatedScheduleDto = createScheduleDto.parse(dto);
        const newSchedule = Schedule.fromCreateScheduleDto(validatedScheduleDto);
        this.__schedules.set(newSchedule.id, newSchedule);

        const databaseSchedule = ScheduleDatabase.getInstance();
        databaseSchedule.addSchedule(newSchedule.toScheduleSchema());

        return newSchedule;
    }

    public findAll() {
        return Array.from(this.__schedules.values());
    }

}