import { EventBus } from "../../shared/event_bus";
import type { Light, LightCommand, CreateLightDTO } from "./light.types";

/**
 * LIGHT DEVICE - SIMPLIFICADO
 *
 * Apenas Light Switch (on/off)
 */
export class LightDevice {
    public readonly id: string;
    public name: string;
    public isOnline: boolean = false;
    public lastUpdate: Date = new Date(0);

    public readonly controllerId: string;
    public readonly endpointName: string;
    public value: number = 0;  // 0 ou 1

    private onEndpointUpdateCallback: (data: any) => void;

    constructor(data: Light) {
        this.id = data.id;
        this.name = data.name;
        this.isOnline = data.isOnline;
        this.lastUpdate = data.lastUpdate;
        this.controllerId = data.controllerId;
        this.endpointName = data.endpointName;
        this.value = data.value;

        // Bind callback
        this.onEndpointUpdateCallback = this.handleEndpointUpdate.bind(this);

        // Escuta atualizações de endpoints
        EventBus.getInstance().subscribe('endpoint_event', this.onEndpointUpdateCallback);

        // Força leitura inicial
        this.requestCurrentValue();
    }

    /**
     * Atualização de endpoint vindo do controller
     */
    private handleEndpointUpdate(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }): void {
        // Verifica se é o endpoint deste device
        if (
            data.controllerId === this.controllerId &&
            data.endpointName === this.endpointName
        ) {
            this.value = data.value;
            this.isOnline = true;
            this.lastUpdate = new Date();

            // Emite evento de mudança
            EventBus.getInstance().publish('light_value_changed', {
                lightId: this.id,
                timestamp: this.lastUpdate
            });
        }
    }

    /**
     * Solicita valor atual do endpoint
     */
    private requestCurrentValue(): void {
        EventBus.getInstance().publish('force_read_endpoint', {
            controllerId: this.controllerId,
            endpointName: this.endpointName
        });
    }

    /**
     * Executa comando na lâmpada
     */
    public async executeCommand(command: LightCommand): Promise<void> {
        let targetValue: number;

        switch (command.action) {
            case 'turnOn':
                targetValue = 1;
                break;
            case 'turnOff':
                targetValue = 0;
                break;
            case 'toggle':
                targetValue = this.value === 1 ? 0 : 1;
                break;
        }

        await this.setEndpointValue(targetValue);
    }

    /**
     * Define valor do endpoint (envia ao controller)
     */
    private async setEndpointValue(value: number): Promise<void> {
        // Validação digital (0 ou 1)
        if (value !== 0 && value !== 1) {
            throw new Error('Valor deve ser 0 ou 1');
        }

        // Envia comando ao controller via EventBus
        EventBus.getInstance().publish('controller_action', {
            id: this.controllerId,
            endpointName: this.endpointName,
            type: value === 1 ? 'setOn' : 'setOff',
            value
        });
    }

    /**
     * Serializa para enviar ao frontend
     */
    public toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            isOnline: this.isOnline,
            lastUpdate: this.lastUpdate.toISOString(),
            value: this.value,
            controllerId: this.controllerId,
            endpointName: this.endpointName
        };
    }

    /**
     * Cleanup
     */
    public destroy(): void {
        EventBus.getInstance().unsubscribe('endpoint_event', this.onEndpointUpdateCallback);
    }

    /**
     * Factory method - cria lâmpada baseado no DTO
     */
    public static create(id: string, dto: CreateLightDTO): LightDevice {
        return new LightDevice({
            id: id,
            name: dto.name,
            isOnline: false,
            lastUpdate: new Date(0),
            controllerId: dto.controllerId,
            endpointName: dto.endpointName,
            value: 0
        });
    }
}
