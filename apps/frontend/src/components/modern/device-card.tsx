import LevelSensor from "./device-level-card";
import PumpControl from "./device-pump-card";

interface DeviceType {
    id: string;
    type: string;
    name: string;
    value: number;
}

const mock: DeviceType = {
    id: "1",
    type: "level",
    name: "Pump 1",
    value: 0,
}

export default function DeviceCard({ device = mock, className }: { device?: DeviceType, className?: string }) {
    switch (device.type) {
        case "pump":
            return (
                <PumpControl device={device} className={className} />
            )
        case "level":
            return (
                <LevelSensor device={device} className={className} />
            )
        default:
            return (
                <div className={className}>
                    <h1>Device Card</h1>
                </div>
            )
    }
}