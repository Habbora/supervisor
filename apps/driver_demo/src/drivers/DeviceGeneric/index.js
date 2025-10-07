// É um objeto que é injetado no driver quando inicializado e tiver os dados do dispositivo salvo em uma pasta de drivers
// Logo ele pode ter varios Driver iguais mas com dados diferentes isso vai depender do id do driver carregado.
// Ideia é criar um json com nome do ir do driver e o id do driver carregado.
// Para isso os configs precisa obrigatoriamente ter o id e o driver e o tag do driver que é o unico identificador do driver. chamado de tag.

export default class DeviceGenericDriver {
    constructor(system) {
        this.name = 'DeviceGenericDriver';
        this.type = 'device';
        this.version = '0.0.1';
        this.category = 'light';
        this.endpoints = new Map();
        this.system = system;
    }

    getActions() {
        return {
            getValue: () => {
            },
            setOn: () => {
                const address = this.endpoints.get('default')?.address;
                this.system.eventBus.publish('controller_action', {
                    id: address,
                    endpointName: 'default',
                    type: 'setOn',
                });
            },
            setOff: () => {
                const address = this.endpoints.get('default')?.address;
                this.system.eventBus.publish('controller_action', {
                    id: address,
                    endpointName: 'default',
                    type: 'setOff',
                });
            },
            setToggle: () => {
                const address = this.endpoints.get('default')?.address;
                this.system.eventBus.publish('controller_action', {
                    id: address,
                    endpointName: 'default',
                    type: 'setToggle',
                });
            },
        };
    }

    async read() { }

    async save() { }

    async update() { }
}