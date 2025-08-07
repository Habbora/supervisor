"use client";

import ControllerAddCard from "@/components/modern/controller-add-card";
import ControllerCard from "@/components/modern/controller-card";
import ControllerForm from "@/components/modern/controller-form";
import ModernHeader from "@/components/modern/modern-header";
import { ControllerType, ControllerFormDataTypes, ControllerPostDataTypes } from "@/types/forms/controller.types";
import { useEffect, useState } from "react";

export default function ControllersPage() {
    const [controllers, setControllers] = useState<ControllerType[]>([]);

    const loadControllers = async () => {
        const response = await fetch('http://localhost:3000/api/controllers');
        const data = await response.json() as ControllerType[];
        setControllers(data);
    }

    useEffect(() => {
        loadControllers();
    }, []);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState<"add" | "edit">("add");
    const [formController, setFormController] = useState<ControllerFormDataTypes | undefined>(undefined);

    const handleOpenForm = (type: "add" | "edit", controller?: ControllerType) => {
        setIsFormOpen(true);
        setFormType(type);

        const controllerData: ControllerFormDataTypes | undefined = controller ? {
            id: controller.id,
            name: controller.name,
            driverName: controller.driverName,
            host: controller.network.host,
            port: controller.network.port,
        } : undefined;

        setFormController(controllerData);
    }

    const handleAddController = async (controller: ControllerFormDataTypes) => {
        const response = await fetch("http://localhost:3000/api/controllers", {
            method: "POST",
            body: JSON.stringify({
                name: controller.name,
                driverName: controller.driverName,
                network: {
                    host: controller.host,
                    port: controller.port,
                },
            }),
        })

        if (response.ok) {
            loadControllers();
        }
    }

    const handleEditController = async (controller: ControllerFormDataTypes) => {
        const controllerData: ControllerPostDataTypes = {
            id: controller.id!,
            name: controller.name,
            driverName: controller.driverName,
            network: {
                type: "tcp",
                host: controller.host,
                port: controller.port,
            },
        }

        const response = await fetch(`http://localhost:3000/api/controllers/${controller.id}`, {
            method: "PUT",
            body: JSON.stringify(controllerData),
        })

        if (response.ok) {
            loadControllers();
            setIsFormOpen(false);
        }
    }

    const handleRemoveController = async (controller: ControllerFormDataTypes) => {
        console.log(controller);

        const response = await fetch(`http://localhost:3000/api/controllers/${controller.id}`, {
            method: "DELETE",
        })

        if (response.ok) {
            loadControllers();
        }

        loadControllers();
        setIsFormOpen(false);
    }

    return (
        <div className="flex flex-col gap-2">
            <ModernHeader title="⚙️ Configurações" subtitle="Controladores" />
            <div className="flex flex-wrap gap-4">
                {controllers.map((controller) => (
                    <ControllerCard key={controller.id} device={controller} onClick={() => handleOpenForm("edit", controller)} />
                ))}

                <ControllerAddCard onClick={() => handleOpenForm("add")} />
            </div>

            {/* TODO: Fazer virar um formulario apenas. */}

            {isFormOpen && (
                <ControllerForm
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={formType === "add" ? handleAddController : handleEditController}
                    type={formType}
                    controller={formController}
                    onRemove={handleRemoveController}
                />
            )}
        </div>
    )
}