import { LightService } from "../../../../services/light/LightService";

export const GET = async (req: any) => {
  const lightService = (global as any).lightService as LightService;

  try {
    const url = new URL(req.url);
    const lightName = url.searchParams.get('lightName');
    const action = url.searchParams.get('action') as "setOff" | "setOn" | "setToggle";

    if (!lightName || !action) {
      return new Response("Parâmetros lightName e action são obrigatórios", { status: 400 });
    }
    
    if (!lightService) {
        return new Response("Serviço de luz não inicializado", { status: 500 });
    }

    const light = lightService.getLightByName(lightName);

    if (!light) {
        return new Response("Lampada não encontrada", { status: 404 });
    }

    switch (action) {
        case "setOff":
            await lightService.setOff(lightName);
            break;
        case "setOn":
            await lightService.setOn(lightName);
            break;
        case "setToggle":
            await lightService.setToggle(lightName);
            break;
    }

    console.log("Lampada atualizada com sucesso");
    return new Response(JSON.stringify({
      message: "Lampada atualizada com sucesso"
    }), { status: 200 });
  } catch (error) {
    console.error("Error ao atualizar lampada");
    return new Response("Erro ao atualizar lampada", { status: 500 });
  }
};
