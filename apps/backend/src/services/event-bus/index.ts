export class EventBus {
    private static __instance: EventBus;
    private subscribers: Map<string, ((data: any) => void)[]> = new Map();

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.__instance) EventBus.__instance = new EventBus();
        return EventBus.__instance;
    }

    public subscribe(event: string, callback: (data: any) => void): this {
        if (!this.subscribers.has(event)) this.subscribers.set(event, []);
        this.subscribers.get(event)?.push(callback);
        return this;
    }

    public unsubscribe(event: string, callback: (data: any) => void): this {
        const callbacks = this.subscribers.get(event);
        if (callbacks) this.subscribers.set(event, callbacks.filter(cb => cb !== callback));
        return this;
    }

    public async publish(event: string, data: any) {
        const callbacks = this.subscribers.get(event);
        if (callbacks) await Promise.all(callbacks.map(cb => cb(data)));
        return this;
    }
}