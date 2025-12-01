import { EventBus } from "../../shared/event-bus";
import { LightDevice } from "./Light";
import type { LightCommand, CreateLightDTO } from "./light.types";
import { db, lights } from "@/db"

/**
 * LIGHT SERVICE - Gerencia todas as lâmpadas
 *
 * - Singleton
 * - Escuta eventos do EventBus
 * - CRUD de lâmpadas
 * - Execução de comandos
 */
export class LightService {
    private static instance: LightService | null = null;
    private lights: Map<string, LightDevice> = new Map();

    private constructor() {
        this.setupEventListeners();
    }

    public static getInstance(): LightService {
        if (!LightService.instance) {
            LightService.instance = new LightService();
        }
        return LightService.instance;
    }

    /**
     * Carrega lâmpadas do banco de dados
     */
    public async loadFromDatabase() {
        const lights = await db.query.lights.findMany();
        lights.forEach(light => {
            const lightDevice = LightDevice.create(light.id, {
                name: light.name,
                controllerId: light.controller_id,
                endpointName: light.endpoint_name
            });
            this.lights.set(lightDevice.id, lightDevice);
        });
    }

    /**
     * Configura listeners do EventBus
     */
    private setupEventListeners(): void {
        // Escuta comandos de lâmpadas
        EventBus.getInstance().subscribe('light_cmd', this.handleLightCommand.bind(this));
    }

    /**
     * Trata comandos recebidos via EventBus
     */
    private async handleLightCommand(data: {
        lightId: string;
        command: LightCommand;
    }): Promise<void> {
        const light = this.lights.get(data.lightId);
        if (!light) {
            console.error(`[LightService] Lâmpada ${data.lightId} não encontrada`);
            return;
        }

        try {
            await light.executeCommand(data.command);
            console.log(`[LightService] Comando executado na lâmpada ${data.lightId}:`, data.command);
        } catch (error) {
            console.error(`[LightService] Erro ao executar comando na lâmpada ${data.lightId}:`, error);
            throw error;
        }
    }

    /**
     * Cria nova lâmpada
     */
    public create(id: string, dto: CreateLightDTO): LightDevice {
        const light = LightDevice.create(id, dto);
        this.lights.set(light.id, light);

        EventBus.getInstance().publish('light_created', {
            lightId: light.id
        });

        return light;
    }

    /**
     * Busca lâmpada por ID
     */
    public findById(id: string): LightDevice | undefined {
        return this.lights.get(id);
    }

    /**
     * Lista todas as lâmpadas
     */
    public findAll(): LightDevice[] {
        return Array.from(this.lights.values());
    }


    /**
     * Atualiza lâmpada
     */
    public update(id: string, data: { name?: string }): LightDevice {
        const light = this.lights.get(id);
        if (!light) {
            throw new Error(`Lâmpada ${id} não encontrada`);
        }

        if (data.name) {
            light.name = data.name;
        }

        EventBus.getInstance().publish('light_updated', {
            lightId: id
        });

        return light;
    }

    /**
     * Remove lâmpada
     */
    public delete(id: string): void {
        const light = this.lights.get(id);
        if (!light) {
            throw new Error(`Lâmpada ${id} não encontrada`);
        }

        light.destroy();
        this.lights.delete(id);

        EventBus.getInstance().publish('light_deleted', {
            lightId: id
        });
    }

    /**
     * Envia comando para lâmpada
     */
    public async sendCommand(lightId: string, command: LightCommand): Promise<void> {
        const light = this.lights.get(lightId);
        if (!light) {
            throw new Error(`Lâmpada ${lightId} não encontrada`);
        }

        await light.executeCommand(command);
    }

    /**
     * Busca lâmpadas online
     */
    public findOnline(): LightDevice[] {
        return Array.from(this.lights.values()).filter(light => light.isOnline);
    }

    /**
     * Busca lâmpadas offline
     */
    public findOffline(): LightDevice[] {
        return Array.from(this.lights.values()).filter(light => !light.isOnline);
    }


    /**
     * Status do serviço
     */
    public getStatus() {
        return {
            total: this.lights.size,
            online: this.findOnline().length,
            offline: this.findOffline().length
        };
    }

    /**
     * Shutdown - limpa todos os recursos
     */
    public shutdown(): void {
        console.log('[LightService] Desligando...');

        // Destroi todas as lâmpadas
        for (const light of this.lights.values()) {
            light.destroy();
        }

        this.lights.clear();

        // Remove listeners
        EventBus.getInstance().unsubscribe('light_cmd', this.handleLightCommand.bind(this));

        console.log('[LightService] Desligado');
    }
}
