



export default async function DevicePage({ params }: { params: Promise<{ deviceId: string }> }) {
    const { deviceId } = await params;
    return <div>DevicePage {deviceId}</div>;
}