import EventEmitter from "events";
import type { Device } from "../controller/Device";
import type { DeviceControllerDto, DeviceDto } from "./types/dto.type";
import { DeviceError, type DeviceEventData, type IDevice } from "./types/device.type";

export type LevelDto = DeviceDto & {
    value?: number;
    type: "level";
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
        if (dto.type !== 'level') {
            throw new DeviceError('Tipo de dispositivo inválido');
        }

        super();
        this._id = dto.id;
        this._name = dto.name;
        this._value = dto.value ?? 0;
        this._controller = dto.controller;
        this._endpoint = dto.endpoint;
    }

    /**
     * Manipula eventos do dispositivo
     * @param data - Dados do evento recebido
     * @throws {DeviceError} Se os dados do evento forem inválidos
     */
    onDeviceEvent(data: DeviceEventData): this {
        try {
            this.emit('valueChanged', data);
        } catch (error) {
            this.emit('error', new DeviceError('Erro ao processar evento do dispositivo'));
            throw error;
        }
        return this;
    }

    /**
     * Configura o controlador do dispositivo
     * @param config - Configuração do controlador
     * @returns O próprio dispositivo para encadeamento
     * @throws {DeviceError} Se o controlador for inválido
     */
    addController(config: DeviceControllerDto): this {
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

    get value(): number {
        return this._value;
    }
}
