export class EventBus {
    private static instance: EventBus;
    private subscribers: Map<string, (data: any) => void> = new Map();

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(event: string, callback: (data: any) => void): void {
        this.subscribers.set(event, callback);
    }

    public publish(event: string, data: any): void {
        const callback = this.subscribers.get(event);
        if (callback) {
            callback(data);
        }
        console.log(`Event ${event} published with data:`, data);
    }
}