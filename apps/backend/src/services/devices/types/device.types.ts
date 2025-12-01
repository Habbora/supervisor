/**
 * DEVICE MODEL - UNIVERSAL & EXTENSIBLE
 *
 * Filosofia:
 * - 1 Device = 1 Endpoint Físico (sempre atômico)
 * - Backend: Simples, direto, escalável
 * - Frontend: Agrupa devices usando metadata.group
 * - Protocolos: Modbus, OCPP, BACnet, MQTT, etc (via metadata.protocol)
 */

export type EndpointType = 'digital' | 'analog';
export type EndpointDirection = 'input' | 'output' | 'both';

/**
 * Protocolos suportados
 */
export type DeviceProtocol =
    | 'modbus'      // Modbus TCP/IP (atual)
    | 'ocpp'        // OCPP (carregadores EV)
    | 'bacnet'      // BACnet (HVAC, automação predial)
    | 'mqtt'        // MQTT (sensores IoT)
    | 'http'        // REST API
    | 'websocket'   // WebSocket
    | 'canbus'      // CAN Bus (elevadores, veículos)
    | 'other';

/**
 * Tipos de devices (subType)
 * Define o comportamento no frontend
 */
export type DeviceSubType =
    // Iluminação
    | 'light'           // Lâmpada on/off
    | 'dimmer'          // Lâmpada com intensidade
    | 'rgb_light'       // Lâmpada RGB

    // Água/Bombas
    | 'pump'            // Bomba on/off
    | 'pump_motor'      // Motor da bomba (parte de um grupo)
    | 'flow_sensor'     // Sensor de fluxo
    | 'pressure_sensor' // Sensor de pressão
    | 'level_sensor'    // Sensor de nível
    | 'valve'           // Válvula

    // Temperatura
    | 'temperature_sensor'
    | 'heater'
    | 'cooler'
    | 'thermostat'

    // Acesso/Segurança
    | 'door_lock'
    | 'door_sensor'
    | 'motion_sensor'
    | 'access_reader'

    // Energia
    | 'ev_charger'      // Carregador EV (OCPP)
    | 'power_meter'     // Medidor de energia
    | 'solar_inverter'  // Inversor solar

    // Elevadores/Transportes
    | 'elevator_call'
    | 'elevator_status'
    | 'gate_motor'

    // Genérico
    | 'sensor'
    | 'actuator'
    | 'other';

/**
 * Device - representa um único endpoint físico
 */
export interface Device {
    // Identificação
    id: string;
    name: string;

    // Conexão física (protocolo genérico)
    connection: {
        controllerId: string;   // ID do controller/gateway
        endpointName: string;   // Nome/endereço do endpoint
    };

    // Tipo de dado
    type: EndpointType;         // digital ou analog
    direction: EndpointDirection; // input, output, both

    // Valor atual (sincronizado)
    value: number;
    isOnline: boolean;
    lastUpdate: Date;

    // Range (para analog)
    unit?: string;              // L/min, °C, kW, %, etc
    min?: number;
    max?: number;

    // Metadados (frontend + integrações)
    metadata: {
        subType: DeviceSubType;
        protocol: DeviceProtocol;

        // Agrupamento lógico (frontend usa pra agrupar devices)
        group?: string;          // Ex: "bomba-reservatorio-1"

        // UI
        description?: string;
        location?: string;
        icon?: string;
        color?: string;

        // Tags/categorias
        tags?: string[];         // Ex: ["critical", "agua", "automatico"]

        // Protocolo-específico (JSON livre)
        protocolData?: Record<string, any>;  // Ex: { ocppId: "CP001", connectorType: "Type2" }
    };
}

/**
 * DTO para criar device
 */
export interface CreateDeviceDTO {
    name: string;
    controllerId: string;
    endpointName: string;
    type: EndpointType;
    direction?: EndpointDirection;  // Padrão: 'both'

    // Range (opcional, para analog)
    unit?: string;
    min?: number;
    max?: number;

    // Metadados
    metadata: {
        subType: DeviceSubType;
        protocol: DeviceProtocol;
        group?: string;
        description?: string;
        location?: string;
        icon?: string;
        color?: string;
        tags?: string[];
        protocolData?: Record<string, any>;
    };
}

/**
 * DTO para atualizar device
 */
export interface UpdateDeviceDTO {
    name?: string;
    unit?: string;
    min?: number;
    max?: number;
    metadata?: Partial<Device['metadata']>;
}

/**
 * Comandos que um device pode receber
 */
export type DeviceCommand =
    | { action: 'setValue'; value: number }
    | { action: 'toggle' }
    | { action: 'turnOn' }
    | { action: 'turnOff' }
    | { action: 'pulse'; duration?: number }

    // Comandos protocolo-específicos (futuro)
    | { action: 'custom'; command: string; params?: Record<string, any> };

/**
 * Evento de mudança de valor
 */
export interface DeviceValueChangedEvent {
    deviceId: string;
    oldValue: number;
    newValue: number;
    timestamp: Date;
    source: 'controller' | 'command' | 'schedule' | 'external';
}

/**
 * Response para API
 */
export interface DeviceResponse {
    id: string;
    name: string;
    connection: {
        controllerId: string;
        endpointName: string;
    };
    type: EndpointType;
    direction: EndpointDirection;
    value: number;
    isOnline: boolean;
    lastUpdate: string;
    unit?: string;
    min?: number;
    max?: number;
    metadata: Device['metadata'];
}

/**
 * Agrupamento de devices (usado pelo frontend)
 */
export interface DeviceGroup {
    name: string;               // "bomba-reservatorio-1"
    displayName: string;        // "Bomba Reservatório 1"
    devices: Device[];
    primaryDeviceId?: string;   // Device principal do grupo
    metadata?: {
        subType?: string;       // "pump_system"
        location?: string;
        icon?: string;
        color?: string;
    };
}
