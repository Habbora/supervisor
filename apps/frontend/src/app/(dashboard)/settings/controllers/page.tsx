import ControllersClientPage from "./ControllersClientPage";
import { controllersService } from "@/services/api/controllers.service";

export default async function ControllersPage() {
    let controllers = await controllersService.getAll()
    return <ControllersClientPage controllers={controllers ?? []} />
}