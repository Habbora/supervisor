import { EventBus } from "../event-bus";
import { Device } from "./Device";
import type { CreateDeviceDTO, UpdateDeviceDTO, DeviceCommand } from "./types/device.types";

/**
 * DEVICE SERVICE SIMPLIFICADO
 *
 * - Gerencia Map de devices em memória
 * - Escuta comandos via EventBus ('device_cmd')
 * - Não precisa de DeviceFactory (todos devices são iguais)
 * - Não precisa de DeviceDatabase JSON (vai usar SQLite no futuro)
 */
export class DeviceService {
    private static instance: DeviceService;
    private devices: Map<string, Device> = new Map();
    private onDeviceCmdCallback: (data: any) => void;

    private constructor() {
        // Bind para poder fazer unsubscribe
        this.onDeviceCmdCallback = this.handleDeviceCommand.bind(this);

        // Escuta comandos enviados para devices
        EventBus.getInstance().subscribe('device_cmd', this.onDeviceCmdCallback);

        // TODO: Carregar devices do banco de dados
        // this.loadFromDatabase();
    }

    public static getInstance(): DeviceService {
        if (!DeviceService.instance) {
            DeviceService.instance = new DeviceService();
        }
        return DeviceService.instance;
    }

    /**
     * Trata comandos enviados via EventBus
     * Formato esperado: { deviceId: string, command: DeviceCommand }
     */
    private async handleDeviceCommand(data: {
        deviceId: string;
        command: DeviceCommand;
    }): Promise<void> {
        const device = this.devices.get(data.deviceId);

        if (!device) {
            console.error(`[DeviceService] Device ${data.deviceId} não encontrado`);
            return;
        }

        try {
            await device.executeCommand(data.command);
            console.log(`[DeviceService] Comando executado: ${data.command.action} em ${device.name}`);
        } catch (error) {
            console.error(`[DeviceService] Erro ao executar comando:`, error);
        }
    }

    /**
     * Lista todos os devices
     */
    public findAll(): Device[] {
        return Array.from(this.devices.values());
    }

    /**
     * Busca device por ID
     */
    public findById(id: string): Device | undefined {
        return this.devices.get(id);
    }

    /**
     * Cria um novo device
     */
    public create(dto: CreateDeviceDTO): Device {
        const device = Device.create(dto);
        this.devices.set(device.id, device);

        console.log(`[DeviceService] Device criado: ${device.name} (${device.id})`);

        // TODO: Salvar no banco de dados
        // await this.saveToDatabase(device);

        return device;
    }

    /**
     * Atualiza um device existente
     */
    public update(id: string, dto: UpdateDeviceDTO): Device | undefined {
        const device = this.devices.get(id);

        if (!device) {
            return undefined;
        }

        device.update(dto);

        console.log(`[DeviceService] Device atualizado: ${device.name} (${id})`);

        // TODO: Atualizar no banco de dados
        // await this.updateInDatabase(device);

        return device;
    }

    /**
     * Remove um device
     */
    public remove(id: string): boolean {
        const device = this.devices.get(id);

        if (!device) {
            return false;
        }

        // Cleanup
        device.destroy();
        this.devices.delete(id);

        console.log(`[DeviceService] Device removido: ${device.name} (${id})`);

        // TODO: Remover do banco de dados
        // await this.deleteFromDatabase(id);

        return true;
    }

    /**
     * Envia comando para um device
     * (atalho para publicar no EventBus)
     */
    public async sendCommand(deviceId: string, command: DeviceCommand): Promise<void> {
        await EventBus.getInstance().publish('device_cmd', {
            deviceId,
            command
        });
    }

    /**
     * Cleanup - para testes
     */
    public destroy(): void {
        // Remove todos os devices
        for (const device of this.devices.values()) {
            device.destroy();
        }
        this.devices.clear();

        // Remove listener
        EventBus.getInstance().unsubscribe('device_cmd', this.onDeviceCmdCallback);
    }

    // ===== TODO: Métodos de persistência =====

    // private async loadFromDatabase(): Promise<void> {
    //     // Carregar do SQLite
    // }

    // private async saveToDatabase(device: Device): Promise<void> {
    //     // Salvar no SQLite
    // }

    // private async updateInDatabase(device: Device): Promise<void> {
    //     // Atualizar no SQLite
    // }

    // private async deleteFromDatabase(id: string): Promise<void> {
    //     // Deletar do SQLite
    // }
}
