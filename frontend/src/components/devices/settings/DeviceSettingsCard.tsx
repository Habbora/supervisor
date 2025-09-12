import LevelSensor from "@/components/modern/device-level-card";
import PumpControl from "@/components/modern/device-pump-card";
import { DeviceType } from "@/types/forms/device.type";

export default function DeviceSettingsCard({ device }: { device: DeviceType }) {
    switch (device.type) {
        case "pump":
            return (
                <PumpControl device={device} />
            )
        case "level":
            return (
                <LevelSensor device={device} />
            )
        default:
            return (
                <div>
                    <h1>Device Card</h1>
                </div>
            )
    }
}