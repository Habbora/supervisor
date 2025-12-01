import { notFound } from "next/navigation";
import ControllerClientPage from "./ControllerClientPage";
import { controllersService } from "@/services/api/controllers.service";

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{
        id: string
    }>
}

export default async function ControllerPage(props: Props) {
    const { id } = await props.params
    const controller = await controllersService.getById(id)
    const schemas = await controllersService.getSchemaById(id)

    if (!controller) {
        notFound();
    }

    console.log(schemas.properties)

    return <ControllerClientPage initialController={controller} initialSchema={schemas.properties.configs} />
}
