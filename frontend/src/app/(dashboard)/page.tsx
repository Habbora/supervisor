import DeviceCard from "@/components/modern/device-card";
import ModernHeader from "@/components/modern/modern-header";

const levelMock = {
    id: "1",
    type: "level",
    name: "Reservatório Inferior",
    value: 100,
}

const pumpMock = {
    id: "2",
    type: "pump",
    name: "Pump 2",
    value: 100,
}

export default async function DashboardPage() {
    return (
        <div className="flex flex-col gap-2">
            <ModernHeader title="Dashboard" />
            <div className="flex flex-col gap-2 p-2 border-2 border-gray-200 rounded-lg">
                <DeviceCard device={levelMock} />
                <DeviceCard device={pumpMock} />
            </div>
        </div>
    );
}