export type UserRoles = 'super' | 'admin' | 'user' | 'viewer';

export interface User {
    id?: number;
    name: string;
    username: string;
    email?: string;
    password_hash: string;
    role: UserRoles;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Logger {
    id?: number;
    module: string;
    level: string;
    message: string;
    timestamp: string;
}

export interface Device {
    id?: number;
    name: string;
    type: string;
    connection_type: 'modbus' | 'tcp' | 'udp' | 'http' | 'bacnet';
    connection_config: string; // JSON string
    endpoints: string; // JSON string
    status: 'online' | 'offline' | 'error';
    created_at?: string;
    updated_at?: string;
}

export interface Controller {
    id?: number;
    name: string;
    type: string;
    config: string; // JSON string
    status: 'online' | 'offline' | 'error';
    created_at?: string;
    updated_at?: string;
}

export interface Schedule {
    id?: number;
    name: string;
    description?: string;
    device_id?: number;
    controller_id?: number;
    schedule_config: string; // JSON string
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DeviceHistory {
    id?: number;
    device_id: number;
    value?: number;
    status?: string;
    timestamp?: string;
}