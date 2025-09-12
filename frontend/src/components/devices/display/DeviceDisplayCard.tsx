import LevelSensor from "@/components/modern/device-level-card";
import PumpControl from "@/components/modern/device-pump-card";
import { DeviceType } from "@/features/device/types";
import LightCard from "../light";
import SwitchCard from "../switch"; 
import OtherCard from "../other";

export default function DeviceDisplayCard({ device, onClick }: { device: DeviceType, onClick?: () => void }) {
    switch (device.type) {
        case "pump":
            return (
                <div onClick={onClick}>
                    <PumpControl device={device} />
                </div>
            )
        case "switch":
            return (
                <div onClick={onClick}>
                    <SwitchCard device={device} />
                </div>
            )
        case "level":
            return (
                <div onClick={onClick}>
                    <LevelSensor device={device} />
                </div>
            )
        case "light":
            return (
                <div onClick={onClick}>
                    <LightCard device={device} />
                </div>
            )
        default:
            return (
                <div onClick={onClick}>
                    <OtherCard device={device} />
                </div>
            )
    }
}