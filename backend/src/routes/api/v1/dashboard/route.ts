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
    console.log('POST request');
    // Primeiro, vamos ler o corpo da requisição como JSON
    const body = await request.json();

    // Esperamos receber um objeto com id e action
    const { id, action } = body;

    // Validação simples para garantir que os campos existem
    if (!id || !action) {
        return new Response(
            JSON.stringify({ error: "Parâmetros 'id' e 'action' são obrigatórios." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Agora, vamos obter a instância do Dashboard e buscar o dispositivo pelo id
    const dashboardInstance = Dashboard.getInstance();
    // O método buildDashboard provavelmente retorna todos os dispositivos
    const dashboardData: any = await dashboardInstance.getDashboard("");
    const device = dashboardData.devices?.find((d: any) => d.id === id);

    if (!device) {
        return new Response(
            JSON.stringify({ error: "Dispositivo não encontrado." }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    // Agora, vamos executar a ação. 
    // Como cada dispositivo pode ter ações diferentes, vamos assumir que existe um método actions no objeto real do dispositivo.
    // Precisamos acessar o objeto real, não apenas os dados do dashboard.
    // Supondo que Dashboard tenha um DeviceService para isso:
    try {
        // Aqui estamos assumindo que existe um DeviceService acessível pelo dashboardInstance
        // e que ele tem um método getDeviceById
        const deviceService = DeviceService.getInstance();
        const realDevice = deviceService?.findById(id);

        //console.log('realDevice', typeof realDevice?.actions[action] === "function");

        if (!realDevice || !realDevice.actions || typeof realDevice.actions[action] !== "function") {
            return new Response(
                JSON.stringify({ error: "Ação não suportada para este dispositivo." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Executa a ação
        await realDevice.actions[action]();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        // Se der erro, retorna mensagem amigável
        return new Response(
            JSON.stringify({ error: "Erro ao executar ação: " + error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

// Explicação para leigos:
// - Adicionamos um método POST para a mesma rota, que recebe comandos para dispositivos.
// - O frontend pode enviar { id, action } para acionar, por exemplo, o toggle de uma luz.
// - O backend valida, busca o dispositivo e executa a ação correspondente.
// - Se der erro, retorna uma mensagem explicando o que aconteceu.





