import { db, schedules } from "@/db";
import { eq } from "drizzle-orm";
import { Schedule } from "./schedule";
import { createScheduleDto, type CreateScheduleDto } from "./schedule.types";
import type { ScheduleAction } from "@/db/types/entities";

/**
 * ScheduleManager
 *
 * Gerencia os schedules em memória e sincroniza com SQLite.
 * Mantém Map de schedules ativos para rápido acesso e execução.
 */
export class ScheduleManager {
    private static __instance: ScheduleManager;
    private __schedules: Map<string, Schedule> = new Map();

    constructor() {
        this.loadFromDatabase();
    }

    public static getInstance() {
        if (!ScheduleManager.__instance) {
            ScheduleManager.__instance = new ScheduleManager();
        }
        return ScheduleManager.__instance;
    }

    private async loadFromDatabase() {
    }

    /**
     * Cria um novo agendamento
     */
    public async create(dto: CreateScheduleDto) {
        const validatedScheduleDto = createScheduleDto.parse(dto);

        const createData = {
            name: validatedScheduleDto.name,
            hour: validatedScheduleDto.time.hour,
            minute: validatedScheduleDto.time.minute,
            isActive: validatedScheduleDto.isActive,
            recurrenceType: validatedScheduleDto.recurrenceType,
            recurrenceConfig: validatedScheduleDto.recurrenceConfig
                ? JSON.stringify(validatedScheduleDto.recurrenceConfig)
                : '{}',
            actions: JSON.stringify(validatedScheduleDto.actions)
        };

        // Cria no banco usando Drizzle ORM
        const [savedSchedule] = await db.insert(schedules)
            .values(createData)
            .returning();

        // Parse para criar instância de Schedule em memória
        const actions: ScheduleAction[] = typeof savedSchedule.actions === 'string'
            ? JSON.parse(savedSchedule.actions)
            : savedSchedule.actions;

        const scheduleSchema = {
            id: savedSchedule.id,
            name: savedSchedule.name,
            time: {
                hour: savedSchedule.hour,
                minute: savedSchedule.minute
            },
            isActive: Boolean(savedSchedule.isActive),
            recurrenceType: savedSchedule.recurrenceType,
            recurrenceConfig: savedSchedule.recurrenceConfig,
            actions,
        };

        const newSchedule = Schedule.fromDatabase(scheduleSchema);
        this.__schedules.set(newSchedule.id, newSchedule);

        console.log(`[ScheduleManager] ✅ Novo agendamento criado: "${newSchedule.name}" (${newSchedule.recurrenceType})`);

        return newSchedule;
    }

    /**
     * Lista todos os schedules
     */
    public findAll() {
        return Array.from(this.__schedules.values());
    }

    /**
     * Busca schedule por ID
     */
    public findById(id: string) {
        return this.__schedules.get(id);
    }

    /**
     * Atualiza um schedule
     */
    public async update(id: string, data: Partial<CreateScheduleDto>) {
        const schedule = this.__schedules.get(id);
        if (!schedule) {
            throw new Error('Agendamento não encontrado');
        }

        // Atualiza no banco
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.time) {
            updateData.hour = data.time.hour;
            updateData.minute = data.time.minute;
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.recurrenceType) updateData.recurrenceType = data.recurrenceType;
        if (data.recurrenceConfig) updateData.recurrenceConfig = JSON.stringify(data.recurrenceConfig);
        if (data.actions) updateData.actions = JSON.stringify(data.actions);

        await db.update(schedules)
            .set(updateData)
            .where(eq(schedules.id, id));

        // Recarrega schedules (recria timers)
        this.__schedules.clear();
        await this.loadFromDatabase();

        return this.__schedules.get(id);
    }

    /**
     * Deleta um schedule
     */
    public async delete(id: string) {
        const schedule = this.__schedules.get(id);
        if (schedule && schedule.timeout) {
            clearTimeout(schedule.timeout);
        }

        this.__schedules.delete(id);
        return await db.delete(schedules)
            .where(eq(schedules.id, id));
    }

    /**
     * Alterna status ativo/inativo
     */
    public async toggleActive(id: string) {
        const schedule = this.__schedules.get(id);
        if (!schedule) {
            throw new Error('Agendamento não encontrado');
        }

        const newIsActive = !schedule.isActive;

        await db.update(schedules)
            .set({ isActive: newIsActive })
            .where(eq(schedules.id, id));

        // Recarrega schedules (recria/remove timers)
        this.__schedules.clear();
        await this.loadFromDatabase();

        return this.__schedules.get(id);
    }
}