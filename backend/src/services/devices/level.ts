import EventEmitter from "events";
import type { Device } from "../controller/Device";

/**
 * Tipo para eventos do dispositivo
 */
export type DeviceEventData = {
    value: number;
    timestamp: number;
    status: 'active' | 'inactive' | 'error';
};

/**
 * Erros específicos do dispositivo
 */
export class DeviceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DeviceError';
    }
}

/**
 * Interface que define o comportamento básico de um dispositivo
 * @interface IDevice
 * @extends EventEmitter
 */
export interface IDevice extends EventEmitter {
    /** Identificador único do dispositivo */
    readonly id: string;
    /** Nome do dispositivo */
    readonly name: string;
    /** Tipo do dispositivo */
    readonly type: string;
    /** Controlador associado ao dispositivo */
    controller?: Device;
    /** Endpoint do dispositivo */
    endpoint?: string;

    /**
     * Método chamado quando um evento do dispositivo ocorre
     * @param data - Dados do evento
     */
    onDeviceEvent(data: DeviceEventData): void;

    /**
     * Configura o controlador do dispositivo
     * @param config - Configuração do controlador
     * @returns O próprio dispositivo para encadeamento
     * @throws {DeviceError} Se o controlador for inválido
     */
    setController(config: ControllerConfig): this;

    /**
     * Remove o controlador do dispositivo
     * @returns O próprio dispositivo para encadeamento
     */
    removeController(): this;

    /** Obtém o controlador do dispositivo */
    get getDevice(): Device | undefined;
}

/**
 * DTO (Data Transfer Object) para criação de um dispositivo de nível
 * @interface LevelDto
 */
export interface LevelDto {
    /** Identificador único do dispositivo */
    id: string;
    /** Nome do dispositivo */
    name: string;
    /** Tipo do dispositivo */
    type: string;
    /** Valor atual do nível (0-100) */
    value: number;
    /** Controlador associado ao dispositivo */
    controller?: Device;
    /** Endpoint do dispositivo */
    endpoint?: string;
}

/**
 * Configuração do controlador
 * @interface ControllerConfig
 */
interface ControllerConfig {
    /** Instância do controlador */
    controller: Device;
    /** Endpoint do dispositivo */
    endpoint: string;
}

/**
 * Classe que representa um dispositivo de nível
 * @class Level
 * @extends EventEmitter
 */
export class Level extends EventEmitter implements IDevice {
    private readonly _id: string;
    private readonly _name: string;
    private _value: number;
    private _controller?: Device;
    private _endpoint?: string;

    /**
     * Cria uma nova instância de um dispositivo de nível
     * @param dto - Dados necessários para criar o dispositivo
     * @throws {DeviceError} Se o valor estiver fora do intervalo válido (0-100)
     */
    constructor(dto: LevelDto) {
        super();
        this._id = dto.id;
        this._name = dto.name;
        this._value = this.validateValue(dto.value);
        this._controller = dto.controller;
        this._endpoint = dto.endpoint;
    }

    /**
     * Valida o valor do nível
     * @private
     * @param value - Valor a ser validado
     * @returns Valor validado
     * @throws {DeviceError} Se o valor estiver fora do intervalo válido
     */
    private validateValue(value: number): number {
        if (value < 0 || value > 100) {
            throw new DeviceError('O valor do nível deve estar entre 0 e 100');
        }
        return value;
    }

    /**
     * Manipula eventos do dispositivo
     * @param data - Dados do evento recebido
     * @throws {DeviceError} Se os dados do evento forem inválidos
     */
    onDeviceEvent(data: DeviceEventData): void {
        try {
            this._value = this.validateValue(data.value);
            this.emit('valueChanged', data);
        } catch (error) {
            this.emit('error', new DeviceError('Erro ao processar evento do dispositivo'));
            throw error;
        }
    }

    /**
     * Configura o controlador do dispositivo
     * @param config - Configuração do controlador
     * @returns O próprio dispositivo para encadeamento
     * @throws {DeviceError} Se o controlador for inválido
     */
    setController(config: ControllerConfig): this {
        if (!config.controller) {
            throw new DeviceError('Controlador inválido');
        }

        try {
            this.removeController();
            config.controller.on(`endpoint:${config.endpoint}`, this.onDeviceEvent.bind(this));
            this._controller = config.controller;
            this._endpoint = config.endpoint;
            return this;
        } catch (error) {
            throw new DeviceError('Erro ao configurar controlador');
        }
    }

    /**
     * Remove o controlador do dispositivo
     * @returns O próprio dispositivo para encadeamento
     */
    removeController(): this {
        try {
            if (this._controller && this._endpoint) {
                this._controller.off(`endpoint:${this._endpoint}`, this.onDeviceEvent);
            }
            this._controller = undefined;
            this._endpoint = undefined;
            return this;
        } catch (error) {
            throw new DeviceError('Erro ao remover controlador');
        }
    }

    /** Obtém o controlador do dispositivo */
    get getDevice(): Device | undefined {
        return this._controller;
    }

    /** Obtém o ID do dispositivo */
    get id(): string {
        return this._id;
    }

    /** Obtém o nome do dispositivo */
    get name(): string {
        return this._name;
    }

    /** Obtém o tipo do dispositivo */
    get type(): string {
        return 'level';
    }

    /** Obtém o valor atual do nível */
    get value(): number {
        return this._value;
    }
}