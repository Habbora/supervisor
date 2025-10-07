import type { DeviceDto } from "./types/dto.type";
import { DeviceError, type DeviceEventData, type DeviceType, type IDevice } from "./types/device.type";
import { Device } from "./Device";
import { EventBus } from "../event-bus";

export type LevelDto = DeviceDto & {
    type: "level";
}

export class DeviceLevel extends Device {
    // Criar um Device Novo!
    constructor(id: string, dto: LevelDto) {
        if (dto.type !== 'level') throw new DeviceError('Tipo de dispositivo inválido');

        super(id, dto);

        if (!this.inputs.find((input) => input.name === "minValue")) {
            this.inputs.push({
                name: "minValue",
                description: "",
                type: "number",
                value: -1
            });
        }

        if (!this.inputs.find((input) => input.name === "maxValue")) {
            this.inputs.push({
                name: "maxValue",
                description: "",
                type: "number",
                value: 50
            });
        }

        if (!this.inputs.find((input) => input.name === "minRefValue")) {
            this.inputs.push({
                name: "minRefValue",
                description: "",
                type: "number",
                value: -1
            });
        }

        if (!this.inputs.find((input) => input.name === "maxRefValue")) {
            this.inputs.push({
                name: "maxRefValue",
                description: "",
                type: "number",
                value: -1
            });
        }

        this.outputs.push({
            name: "value",
            description: "",
            type: "number",
            value: -1
        });

        this.outputs.push({
            name: "porcentageValue",
            description: "",
            type: "number",
            value: -1
        });
    }

    protected onEndpointEvent(data: any): this {
        this.endpoints.forEach((endpoint) => {
            if (endpoint.controllerId === data.controllerId && endpoint.endpointName === data.endpointName) {
                // Fazer uma Regra de 3 para converter o valor do endpoint para o valor do dispositivo.
                let minValue = this.inputs.find((e) => e.name === "minValue")?.value as number;
                let maxValue = this.inputs.find((e) => e.name === "maxValue")?.value as number;
                let minRefValue = this.inputs.find((e) => e.name === "minRefValue")?.value as number;
                let maxRefValue = this.inputs.find((e) => e.name === "maxRefValue")?.value as number;

                let porcentageValue = 0;
                // Etapa 1: Converter o valor para porcentagem.
                // Calculo: (valor - minValue)[Offset] / (maxValue - minValue)[Proporção]
                if (minValue < 0) minValue = 0;

                if (maxValue < 0) {
                    porcentageValue = data.value;
                } else {
                    porcentageValue = (data.value - minValue) / (maxValue - minValue) * 100;
                }

                // Etapa 2: Converter o valor para o valor de unidade.
                // Calculo: porcentageValue * (maxRefValue - minRefValue) + minRefValue
                if (minRefValue < 0) minRefValue = 0;
                if (maxRefValue < 0) maxRefValue = 100;
                let unitValue = porcentageValue * (maxRefValue - minRefValue) + minRefValue;

                this.value = porcentageValue;

                EventBus.getInstance().publish('device_value_changed', {
                    id: this.id,
                    name: this.name,
                    value: this.value
                });

                EventBus.getInstance().publish('device_event', {
                    id: this.id,
                    name: this.name,
                    value: this.value
                });
            }
        });

        return this;
    }
}
