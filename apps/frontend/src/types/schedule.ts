/**
 * Tipos de recorrência de agendamento
 */
export type RecurrenceType = 'once' | 'daily' | 'weekly';

/**
 * Configuração de recorrência
 */
export interface RecurrenceConfig {
    weekdays?: number[]; // 0-6 (domingo-sábado) para recurrence_type = 'weekly'
}

/**
 * Ação a ser executada em um dispositivo
 */
export interface ScheduleAction {
    deviceId: string;
    action: string;
    value: number;
}

/**
 * Agendamento completo
 */
export interface Schedule {
    id: string;
    name: string;
    time: {
        hour: number;
        minute: number;
    };
    isActive: boolean;
    recurrenceType: RecurrenceType;
    recurrenceConfig?: RecurrenceConfig;
    actions: ScheduleAction[];
    nextExecution: string; // ISO string
    lastExecution?: string | null; // ISO string
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
}

/**
 * DTO para criar um novo agendamento
 */
export interface CreateScheduleDto {
    name: string;
    time: {
        hour: number;
        minute: number;
    };
    recurrenceType?: RecurrenceType;
    recurrenceConfig?: RecurrenceConfig;
    isActive?: boolean;
    actions: ScheduleAction[];
}

/**
 * DTO para atualizar um agendamento
 */
export interface UpdateScheduleDto extends Partial<CreateScheduleDto> { }

/**
 * Estatísticas de agendamentos
 */
export interface ScheduleStats {
    total: number;
    active: number;
    inactive: number;
    byType: {
        once: number;
        daily: number;
        weekly: number;
    };
}

/**
 * Resultado da execução manual
 */
export interface ExecuteScheduleResult {
    success: boolean;
    message: string;
    stats: {
        total: number;
        executed: number;
        failed: number;
    };
    results: {
        deviceId: string;
        deviceName?: string;
        action: string;
        value?: number;
        status: 'success' | 'failed';
        error?: string;
    }[];
}

/**
 * Nomes dos dias da semana em português
 */
export const WEEKDAY_NAMES: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
};

/**
 * Nomes curtos dos dias da semana
 */
export const WEEKDAY_SHORT_NAMES: Record<number, string> = {
    0: 'Dom',
    1: 'Seg',
    2: 'Ter',
    3: 'Qua',
    4: 'Qui',
    5: 'Sex',
    6: 'Sáb',
};

/**
 * Ícones de recorrência
 */
export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
    once: 'Única vez',
    daily: 'Diária',
    weekly: 'Semanal',
};
