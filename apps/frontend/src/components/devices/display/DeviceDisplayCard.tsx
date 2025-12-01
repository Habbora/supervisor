import LevelSensor from "@/components/modern/device-level-card";
import PumpControl from "@/components/modern/device-pump-card";
import { DeviceType } from "@/features/device/types";
import SwitchCard from "../switch";
import OtherCard from "../other";
import { LightComponent } from "../LightComponent";
import type { Light } from "@/types/devices/light.type";

export default function DeviceDisplayCard({ device, onClick }: { device: DeviceType, onClick?: () => void }) {
    switch (device.type) {
        case "pulse":
            return (
                <div onClick={onClick}>
                    <SwitchCard device={device} />
                </div>
            )
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
                    <LightComponent device={device as unknown as Light} />
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