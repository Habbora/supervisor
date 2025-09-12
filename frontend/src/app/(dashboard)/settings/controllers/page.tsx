"use client"

import ControllerCard from "@/components/modern/controller-card";
import ModernHeader from "@/components/modern/modern-header";
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { AddCard } from "@/components/AddCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ControllerType } from "@/features/controllers/types";
import { useRouter } from "next/navigation";

export default function ControllersPage() {
    const router = useRouter();

    const { controllers } = useControllers();

    const handleAddController = async () => {
        router.push("/settings/controllers/new");
    }

    const handleControllerClick = (controller: ControllerType) => {
        router.push(`/settings/controllers/${controller.id}`);
    }

    return (
        <div className="flex flex-col gap-2">
            <ModernHeader title="⚙️ Configurações" subtitle="Controladores" />

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Controladores</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {controllers.map((controller) => (
                            <ControllerCard
                                key={controller.id}
                                device={controller}
                                onClick={() => handleControllerClick(controller)}
                            />
                        ))}

                        <AddCard title="Adicionar Controlador" onClick={handleAddController} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}