import { DeviceType } from "@/features/device/types";

export default function OtherCard({ device }: { device: DeviceType }) {
    return (
        <div className="w-[200px] h-[200px] p-4 rounded-lg cursor-pointer select-none transition-colors duration-200 bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <h1>{device.name}</h1>
        </div>
    )
}