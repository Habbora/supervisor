import { Device } from "./Device";
import { EventBus } from "@/services/event-bus";

export class Pulse extends Device {
    type = "pulse";

    constructor(id: string, dto: any) {
        super(id, dto);

        if (!this.endpoints.find(e => e.name === "output")) {
            this.endpoints.push({
                name: "output",
                type: "boolean",
            });
        }

        if (!this.endpoints.find(e => e.name === "feedback")) {
            this.endpoints.push({
                name: "feedback",
                type: "boolean",
            });
        }
    }

    protected async onEndpointEvent(data: {
        controllerId: string;
        endpointName: string;
        value: number;
    }) {
        const endpointFeedback = this.endpoints.find(e => e.name === "feedback");
        if (endpointFeedback?.controllerId === data.controllerId && endpointFeedback?.endpointName === data.endpointName) {
            this.value = data.value;
        }
    }

    public actions = {
        setToggle: async () => {
            const endpointOutput = this.endpoints.find((endpoint) => endpoint.name === "output");

            EventBus.getInstance().publish('controller_action', {
                id: endpointOutput?.controllerId,
                endpointName: endpointOutput?.endpointName,
                type: "setOn",
            })

            await new Promise(resolve => setTimeout(resolve, 3000));

            EventBus.getInstance().publish('controller_action', {
                id: endpointOutput?.controllerId,
                endpointName: endpointOutput?.endpointName,
                type: "setOff",
            })
        }
    }
}