class EventBus {
    private static instance: EventBus;
    private subscribers: Map<string, ((data: any) => Promise<void>)[]> = new Map();

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) EventBus.instance = new EventBus();
        return EventBus.instance;
    }

    public subscribe(event: string, callback: (data: any) => Promise<void>): this {
        if (!this.subscribers.has(event)) this.subscribers.set(event, []);
        this.subscribers.get(event)?.push(callback);
        return this;
    }

    public unsubscribe(event: string, callback: (data: any) => Promise<void>): this {
        const callbacks = this.subscribers.get(event);
        if (callbacks) this.subscribers.set(event, callbacks.filter(cb => cb !== callback));
        return this;
    }

    public async publish(event: string, data: any): Promise<void> {
        const callbacks = this.subscribers.get(event)
        if (callbacks) await Promise.all(callbacks.map(cb => cb(data)))
    }
}

export const eventBus = EventBus.getInstance()