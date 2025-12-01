export type Light = {
    id: string;
    name: string;
    type: 'light';
    value: number; // 0 ou 1
    isOnline: boolean;
    controllerId: string;
    endpointName: string;
    lastUpdate: string;
    // Campos opcionais (legacy)
    isAlert?: boolean;
    group?: string;
}