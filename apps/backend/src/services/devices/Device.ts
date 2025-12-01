import { EventBus } from "../event-bus";
import type {
    Device as IDevice,
    DeviceCommand,
    CreateDeviceDTO,
    UpdateDeviceDTO,
    DeviceValueChangedEvent
} from "./types/device.types";

/**
 * DEVICE - UNIVERSAL & EXTENSIBLE
 *
 * - 1 Device = 1 Endpoint Físico (atômico)
 * - Suporta qualquer protocolo (Modbus, OCPP, BACnet, etc)
 * - Frontend agrupa devices usando metadata.group
 * - Simples de entender, fácil de escalar
 */
export class Device implements IDevice {
    public readonly id: string;
    public name: string;
    public readonly connection: {
        controllerId: string;
        endpointName: string;
    };
    public readonly type: 'digital' | 'analog';
    public readonly direction: 'input' | 'output' | 'both';
    public value: number = -1;
    public isOnline: boolean = false;
    public lastUpdate: Date = new Date(0);
    public unit?: string;
    public min?: number;
    public max?: number;
    public readonly metadata: IDevice['metadata'];

    private onEndpointUpdateCallback: (data: any) => void;

    constructor(data: IDevice) {
        this.id = data.id;
        this.name = data.name;
        this.connection = data.connection;
        this.type = data.type;
        this.direction = data.direction;
        this.value = data.value;
        this.isOnline = data.isOnline;
        this.lastUpdate = data.lastUpdate;
        this.unit = data.unit;
        this.min = data.min;
        this.max = data.max;
        this.metadata = data.metadata;

        // Bind do callback
        this.onEndpointUpdateCallback = this.handleEndpointUpdate.bind(this);

        // Escuta atualizações do controller
        EventBus.getInstance().subscribe('endpoint_event', this.onEndpointUpdateCallback);

        // Força leitura inicial do valor
        this.requestCurrentValue();
    }

    /**
     * Chamado quando o controller atualiza um endpoint
     */
    private handleEndpointUpdate(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }): void {
        // Só processa se for o endpoint deste device
        if (
            data.controllerId !== this.connection.controllerId ||
            data.endpointName !== this.connection.endpointName
        ) {
            return;
        }

        const oldValue = this.value;
        this.value = data.value;
        this.isOnline = true;
        this.lastUpdate = new Date();

        // Se o valor mudou, emite evento
        if (oldValue !== this.value) {
            const event: DeviceValueChangedEvent = {
                deviceId: this.id,
                oldValue,
                newValue: this.value,
                timestamp: this.lastUpdate,
                source: 'controller'
            };

            EventBus.getInstance().publish('device_value_changed', event);
        }
    }

    /**
     * Solicita ao controller o valor atual do endpoint
     */
    private requestCurrentValue(): void {
        EventBus.getInstance().publish('force_read_endpoint', {
            controllerId: this.connection.controllerId,
            endpointName: this.connection.endpointName
        });
    }

    /**
     * Executa um comando no device
     */
    public async executeCommand(command: DeviceCommand): Promise<void> {
        let targetValue: number;

        switch (command.action) {
            case 'setValue':
                targetValue = command.value;
                break;

            case 'turnOn':
                targetValue = 1;
                break;

            case 'turnOff':
                targetValue = 0;
                break;

            case 'toggle':
                if (this.type !== 'digital') {
                    throw new Error('Toggle só funciona para devices digitais');
                }
                targetValue = this.value === 1 ? 0 : 1;
                break;

            case 'pulse':
                if (this.type !== 'digital') {
                    throw new Error('Pulse só funciona para devices digitais');
                }
                // Liga
                await this.setValue(1);
                // Aguarda
                await new Promise(resolve => setTimeout(resolve, command.duration || 250));
                // Desliga
                await this.setValue(0);
                return;

            case 'custom':
                // Para protocolos específicos (OCPP, etc)
                console.log(`[Device] Comando custom: ${command.command}`, command.params);
                // TODO: Implementar dispatcher de comandos por protocolo
                return;

            default:
                throw new Error(`Comando desconhecido: ${(command as any).action}`);
        }

        await this.setValue(targetValue);
    }

    /**
     * Define o valor do device (envia comando ao controller)
     */
    private async setValue(value: number): Promise<void> {
        // Validação
        if (this.type === 'digital' && value !== 0 && value !== 1) {
            throw new Error('Device digital aceita apenas 0 ou 1');
        }

        if (this.type === 'analog') {
            const min = this.min ?? 0;
            const max = this.max ?? 100;
            if (value < min || value > max) {
                throw new Error(`Valor fora do range: ${min}-${max}`);
            }
        }

        // Só permite escrever em outputs
        if (this.direction === 'input') {
            throw new Error('Não é possível escrever em um endpoint de entrada');
        }

        // Envia comando ao controller
        // TODO: Dispatcher por protocolo (Modbus vs OCPP vs BACnet)
        EventBus.getInstance().publish('controller_action', {
            id: this.connection.controllerId,
            endpointName: this.connection.endpointName,
            type: value === 1 ? 'setOn' : 'setOff',  // Modbus format
            value
        });
    }

    /**
     * Atualiza metadados do device
     */
    public update(data: UpdateDeviceDTO): void {
        if (data.name) {
            this.name = data.name;
        }

        if (data.unit !== undefined) {
            this.unit = data.unit;
        }

        if (data.min !== undefined) {
            this.min = data.min;
        }

        if (data.max !== undefined) {
            this.max = data.max;
        }

        if (data.metadata) {
            // Merge metadata
            Object.assign(this.metadata, data.metadata);
        }
    }

    /**
     * Serializa para enviar ao frontend
     */
    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            connection: this.connection,
            type: this.type,
            direction: this.direction,
            value: this.value,
            isOnline: this.isOnline,
            lastUpdate: this.lastUpdate.toISOString(),
            unit: this.unit,
            min: this.min,
            max: this.max,
            metadata: this.metadata
        };
    }

    /**
     * Cleanup - remove listeners
     */
    public destroy(): void {
        EventBus.getInstance().unsubscribe('endpoint_event', this.onEndpointUpdateCallback);
    }

    /**
     * Factory method para criar device
     */
    public static create(dto: CreateDeviceDTO): Device {
        const device: IDevice = {
            id: crypto.randomUUID(),
            name: dto.name,
            connection: {
                controllerId: dto.controllerId,
                endpointName: dto.endpointName
            },
            type: dto.type,
            direction: dto.direction || 'both',
            value: -1,
            isOnline: false,
            lastUpdate: new Date(0),
            unit: dto.unit,
            min: dto.min,
            max: dto.max,
            metadata: dto.metadata
        };

        return new Device(device);
    }
}
