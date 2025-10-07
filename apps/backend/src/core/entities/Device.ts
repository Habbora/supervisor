export abstract class Device {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly type: string,
        public readonly endpoints: Endpoint[] = []
    ) { }

    abstract onEndpointEvent(data: EndpointEventData): void;
    abstract getActions(): DeviceActions;
    abstract validate(): boolean;
}