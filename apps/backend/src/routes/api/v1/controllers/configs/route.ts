import { readControllerConfigs } from "../../../../../services/controllers/utils/readDeviceConfig";

export const GET = async (req: any) => {
    const configs = readControllerConfigs();
    return Response.json(configs);
};
