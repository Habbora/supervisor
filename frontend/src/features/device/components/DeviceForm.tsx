import { useState } from "react";
import { DeviceType, DeviceInput } from "../types";
import DeviceInputTable from "../../../components/devices/DeviceInputTable";

export interface DeviceFormProps {
    type: "add" | "edit";
    device?: DeviceType;
    onClose?: () => void;
    onSubmit?: (formData: DeviceType) => void;
    onRemove?: (formData: DeviceType) => void;
}

export default function DeviceForm({
    onClose,
    onSubmit,
    onRemove,
    type,
    device
}: DeviceFormProps) {
    const [formData, setFormData] = useState<Partial<DeviceType>>(
        device ?? {
            name: "",
            type: "",
        }
    );

    const [deviceInputs, setDeviceInputs] = useState<DeviceInput[]>(
        device?.inputs ?? []
    );

    const [isLoading, setIsLoading] = useState(false);

    const title = type === "add" ? "Adicionar Dispositivo" : "Editar Dispositivo";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            const finalFormData = {
                ...formData,
                inputs: deviceInputs
            } as DeviceType;
            
            onSubmit?.(finalFormData);
            onClose?.();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'port' ? parseInt(value) || 0 : value,
        }));
    };

    const handleDeviceInputChange = (name: string, value: string | number | boolean) => {
        setDeviceInputs(prev => 
            prev.map(input => 
                input.name === name 
                    ? { ...input, value } 
                    : input
            )
        );
    };

    const handleRemove = () => {
        if (window.confirm("Tem certeza que deseja remover este dispositivo?")) {
            onRemove?.(formData as DeviceType);
            onClose?.();
        }
    }

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
                    <h2 className="text-xl font-semibold">{title}</h2>
                    {type === "edit" && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                        >
                            Remover
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Controlador
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Dispositivo
                        </label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Tabela de inputs dinâmicos do device */}
                    <DeviceInputTable
                        inputs={deviceInputs}
                        onChange={handleDeviceInputChange}
                        title="Configurações do Dispositivo"
                    />

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            disabled={isLoading}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}