// Tipos de entidades do banco de dados

export type RecurrenceType = 'once' | 'daily' | 'weekly';

export type RecurrenceConfig = {
    weekdays?: number[];
};

export type ScheduleAction = {
    deviceId: string;
    action: string;
    value: number;
};
