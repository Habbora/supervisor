import { Dashboard } from "@/services/dashboard/index";
import { DeviceService } from "@/services/devices/DeviceService";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync') || "";

    console.log('Sync:', sync);

    const dashboard = await Dashboard.getInstance().getDashboard(sync);

    console.log('Dashboard fetched');

    return Response.json(dashboard);
}

export async function POST(request: Request) {
    const { deviceId, action } = await request.json();

    if (!deviceId || !action) {
        return new Response(
            JSON.stringify({ error: "Parâmetros 'id' e 'action' são obrigatórios." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const device = DeviceService.getInstance().findById(deviceId);

    if (!device) return new Response(JSON.stringify({ success: false, error: "Device not found" }), { status: 404 });

    device?.actions["setToggle"]();

    return Response.json({ success: true }, { status: 200 });
}

// Explicação para leigos:
// - Adicionamos um método POST para a mesma rota, que recebe comandos para dispositivos.
// - O frontend pode enviar { id, action } para acionar, por exemplo, o toggle de uma luz.
// - O backend valida, busca o dispositivo e executa a ação correspondente.
// - Se der erro, retorna uma mensagem explicando o que aconteceu.





