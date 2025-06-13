import EventEmitter from "events";
import type { Device } from "../controller/Device";
import type { DeviceDto } from "./types/dto.type";
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
    private _endpoint?: Map<number, string>;

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
        this._endpoint = dto.endpoint ?? new Map();
    }

    /**
     * Manipula eventos do dispositivo
     * @param data - Dados do evento recebido
     * @throws {DeviceError} Se os dados do evento forem inválidos
     */
    onControllerEvent(data: DeviceEventData): this {
        try {
            this._updateValue(data.value);
        } catch (error) {
            this.emit('error', new DeviceError('Erro ao processar evento do dispositivo'));
            throw error;
        }
        return this;
    }

    /**
     * Configura o controlador do dispositivo
     * @param controller - Configuração do controlador
     * @returns O próprio dispositivo para encadeamento
     * @throws {DeviceError} Se o controlador for inválido
     */
    addController(controller: Device): this {
        this._controller = controller;
        return this;
    }

    /**
     * Remove o controlador do dispositivo
     * @returns O próprio dispositivo para encadeamento
     */
    removeController(): this {
        try {
            this.removeAllEndpoints();
            this._controller = undefined;
            this._endpoint = undefined;
            return this;
        } catch (error) {
            throw new DeviceError('Erro ao remover controlador');
        }
    }

    addEndpoint(endpoint: string, index: number): this {
        if (!this._controller) throw new DeviceError('Controlador não configurado');
        this._endpoint?.set(index, endpoint);
        this._controller.on(`endpoint:${endpoint}`, this.onControllerEvent.bind(this));
        this.emit('endpointAdded', endpoint);
        return this;
    }

    removeEndpoint(endpoint: string, index: number): this {
        if (!this._controller) throw new DeviceError('Controlador não configurado');
        this._controller.off(`endpoint:${endpoint}`, this.onControllerEvent);
        this._endpoint?.delete(index);
        this.emit('endpointRemoved', endpoint);
        return this;
    }

    removeAllEndpoints(): this {
        if (!this._controller) throw new DeviceError('Controlador não configurado');
        this._endpoint?.forEach(endpoint => {
            this._controller!.off(`endpoint:${endpoint}`, this.onControllerEvent);
        });
        this._endpoint = undefined;
        return this;
    }

    private _updateValue(value: number): this {
        this._value = value;
        this.emit('valueChanged', { value });
        return this;
    }

    forceValue(value: number): this {
        this._value = value;
        this.emit('valueChanged', { value });
        return this;
    }

    /** Obtém o controlador do dispositivo */
    get getController(): Device | undefined {
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

    get endpoints(): Map<number, string> {
        return this._endpoint ?? new Map();
    }
}
