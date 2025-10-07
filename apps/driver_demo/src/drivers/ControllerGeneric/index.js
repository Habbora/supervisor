








export default class ControllerGenericDriver {
    constructor(id, system) {
        this.id = id;
        this.name = 'ControllerGenericDriver';
        this.type = 'controller';
        this.version = '0.0.1';
        this.system = system;
        this.socket = null;
        this.properties = [
            {
                name: 'host',
                type: 'string',
                value: null,
            },
            {
                name: 'port',
                type: 'number',
                value: null,
            },
        ]
    }

    network = {
        connect: () => {
            this.socket = new net.Socket();
            setInterval(() => {
                this.system.eventBus.publish('controller_event', {
                    id: this.id,
                    endpointName: 'default',
                    type: 'connected',
                });
            }, 1000);
        },
        disconnect: () => {
            this.socket?.destroy();
            this.socket = null;
        },
    }
}