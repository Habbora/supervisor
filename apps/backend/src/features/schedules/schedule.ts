// Pode ser muito bem uma interface, mas vamos usar uma classe para fins de estudo

import { EventBus } from "@/services/event-bus";
import { createScheduleDto, type CreateScheduleDto } from "./schedule.types";
import { scheduleSchema, type ScheduleSchema } from "./schedule.schema";
import { db, schedules } from "@/db";
import { eq } from "drizzle-orm";
import type { RecurrenceType, RecurrenceConfig } from "@/db/types/entities";

/**
 * Sistema de Agendamento com Suporte a Recorrência
 *
 * Tipos de recorrência suportados:
 * - once: Executa uma única vez e depois desativa automaticamente
 * - daily: Executa todos os dias no horário especificado
 * - weekly: Executa apenas nos dias da semana especificados (0-6: domingo-sábado)
 *
 * Timezone: Usa o timezone local do servidor (Date() nativo)
 */

export class Schedule {
    public readonly id: string;
    public name: string;
    public time: { hour: number, minute: number };
    public actions: { deviceId: string, action: string, value: number }[];
    public isActive: boolean = true;
    public recurrenceType: RecurrenceType = 'daily';
    public recurrenceConfig?: RecurrenceConfig;

    public nextExecution: Date;
    public lastExecution: Date;
    public timeout: Timer | null = null;

    public createdAt: Date = new Date();
    public updatedAt: Date = new Date();
    public deletedAt: Date | null = null;

    private constructor(schema: ScheduleSchema) {
        const validatedSchema = scheduleSchema.parse(schema);

        // Atribui as propriedades obrigatórias do schema.
        this.id = validatedSchema.id;
        this.name = validatedSchema.name;
        this.time = validatedSchema.time;
        this.actions = validatedSchema.actions;
        this.isActive = validatedSchema.isActive !== undefined ? validatedSchema.isActive : true;
        this.recurrenceType = validatedSchema.recurrenceType || 'daily';

        // Parse recurrence_config se existir
        if (validatedSchema.recurrenceConfig) {
            try {
                this.recurrenceConfig = typeof validatedSchema.recurrenceConfig === 'string'
                    ? JSON.parse(validatedSchema.recurrenceConfig)
                    : validatedSchema.recurrenceConfig;
            } catch {
                this.recurrenceConfig = undefined;
            }
        }

        const now = new Date();

        this.nextExecution = validatedSchema.nextExecution || new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.time.hour, this.time.minute, 0, 0);
        if (this.nextExecution.getTime() <= now.getTime()) this.nextExecution.setDate(this.nextExecution.getDate() + 1);

        this.lastExecution = validatedSchema.lastExecution || new Date(0);

        this.createdAt = validatedSchema.createdAt || now;
        this.updatedAt = validatedSchema.updatedAt || now;
        this.deletedAt = validatedSchema.deletedAt || null;

        // Só agenda se estiver ativo
        if (this.isActive) {
            this.schedule();
        }
    }

    public static fromScheduleDto(dto: CreateScheduleDto): Schedule {
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

        // * Mudar para o sistema de logging da aplicação
        console.log(`[Schedule] Agendamento "${this.name}" programado para: ${this.nextExecution.toLocaleString()}`);

        // Passo 4: Agenda a execução
        this.timeout = setTimeout(() => {
            this._executeActions(); // Usa um nome diferente para clareza

            // Passo 5: CRÍTICO - Reagenda o ciclo para a próxima execução (amanhã)
            if (this.isActive) {
                this.schedule();
            }
        }, delay);
    }

    private _calculateNextExecutionDate(): Date {
        const now = new Date()
        const next = new Date()
        next.setHours(this.time.hour, this.time.minute, 0, 0)

        // Se o horário já passou hoje, a próxima execução será amanhã.
        // Isso se aplica a 'once', 'daily' e como ponto de partida para 'weekly'.
        if (next.getTime() <= now.getTime()) {
            next.setDate(next.getDate() + 1)
        }

        // Para 'weekly', precisamos encontrar o próximo dia correto.
        if (this.recurrenceType === 'weekly') {
            if (!this.recurrenceConfig?.weekdays || this.recurrenceConfig.weekdays.length === 0) {
                // Se não tem dias configurados, comporta-se como daily, e a data já está correta.
                // TODO: Mudar para se não tem dias da semana configurados, desativar o agendamento e logar um aviso.
                return next;
            }

            // Procura o próximo dia da semana válido (máximo 7 dias)
            // Garante que a busca pelo próximo dia não entre em loop infinito.
            let daysChecked = 0;
            while (daysChecked < 7) {
                const dayOfWeek = next.getDay(); // 0 = domingo, 6 = sábado
                if (this.recurrenceConfig.weekdays.includes(dayOfWeek)) {
                    return next; // Encontrou, retorna a data.
                }
                next.setDate(next.getDate() + 1);
                daysChecked++;
            }
        }

        // Para 'once', 'daily' e o fallback, a data calculada no início já está correta.
        return next;
    }

    private async _executeActions() {
        this.lastExecution = new Date();
        // * Mudar para o sistema de logging da aplicação
        console.log(`[Schedule] EXECUTANDO "${this.name}" (${this.recurrenceType}) em ${this.lastExecution.toLocaleString()}`);

        console.log(`[Schedule] Disparando ${this.actions.length} ações para "${this.name}"`);

        this.actions.forEach(async (action) => {
            // Publica comando no formato que o DeviceService espera
            await EventBus.getInstance().publish('device_cmd', {
                deviceId: action.deviceId,
                command: {
                    action: action.action as any, // 'turnOn', 'turnOff', 'toggle', etc
                    value: action.value
                }
            });
            console.log(`  -> Comando '${action.action}' enviado para device ${action.deviceId}`);
        });

        // Se for tipo "once", desativa após executar
        if (this.recurrenceType === 'once') {
            console.log(`  🔒 Agendamento único executado. Desativando...`);
            this.isActive = false;

            // Atualiza no banco de dados
            try {
                await db.update(schedules)
                    .set({ isActive: false })
                    .where(eq(schedules.id, this.id));
            } catch (error) {
                console.error('  ❌ Erro ao desativar schedule no banco:', error);
            }

            // Limpa o timeout para não executar novamente
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }

        // Persiste a execução no banco de dados
        try {
            await db.update(schedules)
                .set({
                    lastExecution: this.lastExecution,
                    nextExecution: this.nextExecution
                })
                .where(eq(schedules.id, this.id));
        } catch (error) {
            console.error('  ❌ Erro ao salvar execução no banco:', error);
        }
    }
}
