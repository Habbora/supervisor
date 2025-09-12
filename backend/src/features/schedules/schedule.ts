// Pode ser muito bem uma interface, mas vamos usar uma classe para fins de estudo

import { DeviceService } from "@/services/devices/DeviceService";
import { createScheduleDto, type CreateScheduleDto } from "./schedule.types";
import { scheduleSchema, type ScheduleSchema } from "@/services/database/schedules/schema";

/**
 * Requisito inicial:
 * 1. Executar atividade diaria em um horário específico.
 * 
 * Fluxograma:
 * Start -> Criar um Novo Agendamento -> (Nome, Hora, Ações)
 * -> 
 */

export class Schedule {
    public readonly id: string;
    public name: string;
    public time: { hour: number, minute: number };
    public actions: { deviceId: string, action: string, value: number }[];

    public nextExecution: Date;
    public lastExecution: Date;
    public timeout: Timer | null = null;

    public createdAt: Date = new Date();
    public updatedAt: Date = new Date();
    public deletedAt: Date | null = null;

    private constructor(schema: ScheduleSchema) {
        const validatedSchema = scheduleSchema.parse(schema);
        // Itens obrigatórios.
        this.id = validatedSchema.id;
        this.name = validatedSchema.name;
        this.time = validatedSchema.time;
        this.actions = validatedSchema.actions;

        const now = new Date();

        this.nextExecution = validatedSchema.nextExecution || new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.time.hour, this.time.minute, 0, 0);
        if (this.nextExecution.getTime() <= now.getTime()) this.nextExecution.setDate(this.nextExecution.getDate() + 1);

        this.lastExecution = validatedSchema.lastExecution || new Date(0);

        this.createdAt = validatedSchema.createdAt || now;
        this.updatedAt = validatedSchema.updatedAt || now;
        this.deletedAt = validatedSchema.deletedAt || null;

        this.schedule();
    }

    public static fromCreateScheduleDto(dto: CreateScheduleDto): Schedule {
        const validatedDto = createScheduleDto.parse(dto);
        const schema = { id: crypto.randomUUID(), ...validatedDto };
        return new Schedule(schema);
    }

    public static fromDatabase(schema: ScheduleSchema): Schedule {
        const validateSchema = scheduleSchema.parse(schema);
        return new Schedule(validateSchema);
    }

    public toScheduleSchema(): ScheduleSchema {
        return scheduleSchema.parse(this);
    }

    public schedule() {
        // Passo 1: Limpa qualquer timer antigo para evitar duplicatas
        if (this.timeout) clearTimeout(this.timeout);

        // Passo 2: SEMPRE recalcula a data da próxima execução
        this.nextExecution = this._calculateNextExecutionDate();

        // Passo 3: Calcula o tempo até lá
        const delay = this.nextExecution.getTime() - Date.now();

        console.log(`[Schedule] Agendamento "${this.name}" programado para: ${this.nextExecution.toLocaleString()}`);

        // Passo 4: Agenda a execução
        this.timeout = setTimeout(() => {
            this._executeActions(); // Usa um nome diferente para clareza

            // Passo 5: CRÍTICO - Reagenda o ciclo para a próxima execução (amanhã)
            this.schedule();
        }, delay);
    }

    private _calculateNextExecutionDate(): Date {
        const next = new Date();
        next.setHours(this.time.hour, this.time.minute, 0, 0);

        // Se a hora calculada para hoje já passou, agenda para amanhã
        if (next.getTime() <= Date.now()) {
            next.setDate(next.getDate() + 1);
        }
        return next;
    }

    private _executeActions() {
        this.lastExecution = new Date();
        console.log(`[Schedule] EXECUTANDO "${this.name}" em ${this.lastExecution.toLocaleString()}`);

        this.actions.forEach((action) => {
            const device = DeviceService.getInstance().findById(action.deviceId);
            if (device) {
                console.log(`  -> Ação: ${action.action} no dispositivo ${device.name} com valor ${action.value}`);
                // Aqui entraria a chamada real, ex: device.sendCommand(...)
            }
        });

        // IMPORTANTE: Após executar, o próximo ciclo será iniciado pela chamada recursiva em `schedule()`.
        // Você também deveria salvar o `this.lastExecution` e `this.nextExecution` no banco de dados aqui.
    }
}
