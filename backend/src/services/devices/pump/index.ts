import { Device } from "../Device";





export class DevicePump extends Device {

    constructor(dto: {
        id: string;
        name: string;
        type: "pump";
        endpoint: Map<number, {
            type: "digital_output";
            controller: string;
            endpoint: string;
        }>;
    }) {
        super(dto);
    }


}