import { DeviceService } from "../devices/DeviceService.ts";
import { EventBus } from "../event-bus/index.ts";

export class DeviceHistory {
    private __history: { timestamp: Date, value: any }[] = [];
    private __interval: number = 3000;

    // Informação do dispositivo
    private __deviceId: string;

    constructor(deviceId: string) {
        this.__deviceId = deviceId;
        setInterval(() => this.__onIntervalEvent(), this.__interval);
    }

    private __updateHistory(value: any) {
        this.__history.push({
            timestamp: new Date(),
            value: value
        });

        return this;
    }

    private __onEndpointEvent(data: any) {
        if (data.id === this.__deviceId) {
            this.__updateHistory(data.value);
        }
    }

    private __onIntervalEvent() {
        const device = DeviceService.getInstance().findById(this.__deviceId);

        if (device) {
            this.__updateHistory(device.value);
            EventBus.getInstance().publish('device_value_changed', undefined);
        }
    }

    public getHistory() {
        const device = DeviceService.getInstance().findById(this.__deviceId);

        if (device) {
            this.__history[this.__history.length - 1] = {
                ...this.__history[this.__history.length - 1],
                timestamp: new Date(),
                value: device.value
            };
        }

        return this.__history;
    }
}