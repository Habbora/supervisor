// Arquivo: backend/src/utils/deviceConverter.ts
import { Device } from '@/services/devices/Device';
import { DeviceResponse } from '@/types/api/device.types';

/**
 * Converte uma instância de Device para DeviceResponse
 * Mantém a separação entre lógica de negócio e API
 */
export class DeviceConverter {
    /**
     * Converte Device para DeviceResponse
     * @param device - Instância da classe Device
     * @returns DeviceResponse validado
     */
    static toResponse(device: Device): DeviceResponse {
        return {
            id: device.id,
            name: device.name,
            type: device.type as any,
            value: typeof device.value === 'number' ? device.value : -1,
            endpoints: device.endpoints.map(endpoint => ({
                name: endpoint.name,
                controllerId: endpoint.controllerId,
                endpointName: endpoint.endpointName,
            })),
            inputs: device.inputs.map(input => ({
                name: input.name,
                type: input.type,
                value: input.value
            })),
            outputs: device.outputs.map(output => ({
                name: output.name,
                type: output.type,
                value: output.value
            }))
        };
    }

    /**
     * Converte array de Devices para array de DeviceResponse
     * @param devices - Array de instâncias de Device
     * @returns Array de DeviceResponse
     */
    static toResponseArray(devices: Device[]): DeviceResponse[] {
        return devices.map(device => this.toResponse(device));
    }

    /**
     * Converte Device para DeviceResponse com validação Zod
     * @param device - Instância da classe Device
     * @returns DeviceResponse validado ou lança erro
     */
    static toValidatedResponse(device: Device): DeviceResponse {
        const deviceData = this.toResponse(device);

        // Valida usando o schema Zod
        return DeviceResponse.parse(deviceData);
    }
}   