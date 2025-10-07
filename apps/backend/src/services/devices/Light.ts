import { Device } from "./Device";
import type { DeviceDto } from "./types/dto.type";
import { DeviceError } from "./types/device.type";
import { EventBus } from "../event-bus";

type LightDto = DeviceDto & {
    type: "light";
}

export class Light extends Device {
    constructor(id: string, dto: LightDto) {
        if (dto.type !== 'light') {
            throw new DeviceError('Tipo de dispositivo inválido');
        }
        super(id, dto);
    }

    // Como isso ta retornando um Error para o frontend? Se não tem retorno de Error......... Serio!?
    // Mas ele pega o Error Dentro de Controller Manager e manda um Endpoint Not Found para o frontend.
    // Mas o Error estoura em outro lugar separado pelo EventBus e não deveria, adorei essa coisa, mas não entendo como passar para o frontend.
    public actions = {
        setToggle: () => {
            const endpoint = this.endpoints.find((endpoint) => endpoint.name === "default");

            if (!endpoint) {
                console.error('Endpoint não encontrado');
                return;
            }
            // Saber qual a rota para enviar a mensagem para o controller.
            EventBus.getInstance().publish('controller_action', {
                id: endpoint.controllerId,
                endpointName: endpoint.endpointName,
                type: "setToggle",
            });

            return;
        }
    }
}