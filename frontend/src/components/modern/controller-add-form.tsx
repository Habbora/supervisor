import { useState } from "react";
import { ControllerFormDataTypes } from "@/types/forms/controller.types";

export interface ControllerAddFormProps {
    onClose?: () => void;
    onSubmit?: (formData: ControllerFormDataTypes) => void;
}

export default function ControllerAddForm({ onClose, onSubmit }: ControllerAddFormProps) {
    const [formData, setFormData] = useState<ControllerFormDataTypes>({
        name: "",
        driverName: "",
        host: "",
        port: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
        onClose?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'port' ? parseInt(value) || 0 : value,
        }));
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="bg-black opacity-75 z-10 absolute inset-0"
                onClick={() => onClose?.()}
            />

            <div className="bg-white opacity-90 rounded-lg p-6 w-96 max-w-[90vw] z-20 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Adicionar Controlador</h2>
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Driver
                        </label>
                        <input
                            type="text"
                            id="driverName"
                            name="driverName"
                            value={formData.driverName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <span className="text-sm text-gray-500 font-bold mb-2">
                            Configurações de Rede:
                        </span>
                    </div>


                    <div>
                        <label htmlFor="ip" className="block text-sm font-medium text-gray-700">
                            Endereço IP
                        </label>
                        <input
                            type="text"
                            id="host"
                            name="host"
                            value={formData.host}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="192.168.1.100"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                            Porta
                        </label>
                        <input
                            type="number"
                            id="port"
                            name="port"
                            value={formData.port}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="65535"
                            required
                        />
                    </div>

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