import { useEffect, useState } from "react";
import { ControllerFormDataTypes } from "@/types/forms/controller.type";
import { useControllers } from "@/features/controllers/hooks/useControllers";

export interface ControllerFormProps {
    controller?: ControllerFormDataTypes;
    onClose?: () => void;
    onSubmit?: (formData: ControllerFormDataTypes) => void;
    onRemove?: (controllerId: string) => void;
}

export default function ControllerForm({ onClose, onSubmit }: ControllerFormProps) {
    const { readControllersConfigs } = useControllers();

    const [controllersConfigsList, setControllersConfigsList] = useState<any[]>([]);
    const [controllerName, setControllerName] = useState<string>("");
    const [selectedDriver, setSelectedDriver] = useState<string>("");

    useEffect(() => {
        readControllersConfigs()
            .then((configs) => {
                console.log(configs);
                setControllersConfigsList(configs);
                setSelectedDriver(configs[0].name);
            })
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({
            name: controllerName,
            driverName: selectedDriver,
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center">

            {/* Overlay */}
            <div
                className="bg-black opacity-75 z-10 absolute inset-0"
                onClick={() => onClose?.()}
            />

            {/* Form */}
            <div className="bg-white opacity-90 rounded-lg p-6 w-96 max-w-[90vw] z-20 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Adicionar Controlador</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Controlador
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={controllerName}
                        onChange={(e) => setControllerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    {/* TODO: Adicionar uma lista de drivers para selecionar com circle-ui */}
                    <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                        Configuração do Controlador
                    </label>
                    <select
                        id="driver"
                        name="driver"
                        value={selectedDriver}
                        className="border border-gray-300 rounded-md max-h-40 overflow-y-auto h-max-10 w-full"
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        required
                        size={controllersConfigsList.length}
                    >
                        {controllersConfigsList.map((driver) => (
                            <option
                                key={driver.name}
                                value={driver.name.trim().toLowerCase()}
                                className={`justify-between items-center gap-2 p-2 cursor-pointer text-sm font-medium`}>
                                {driver.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Salvar
                        </button>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}