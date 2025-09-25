import React from 'react';

// Tipo para definir os inputs do device
export interface DeviceInput {
    name: string;
    description: string;
    type: "string" | "number" | "boolean";
    value: string | number | boolean;
}

interface DeviceInputTableProps {
    inputs: DeviceInput[];
    onChange: (name: string, value: string | number | boolean) => void;
    title?: string;
}

export default function DeviceInputTable({ 
    inputs, 
    onChange, 
    title = "Configurações do Dispositivo" 
}: DeviceInputTableProps) {
    
    // Função para renderizar o input baseado no tipo
    const renderInput = (input: DeviceInput) => {
        const { name, description, type, value } = input;

        switch (type) {
            case "boolean":
                return (
                    <div key={name} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={name}
                            checked={Boolean(value)}
                            onChange={(e) => onChange(name, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={name} className="text-sm font-medium text-gray-700">
                            {description || name}
                        </label>
                    </div>
                );

            case "number":
                return (
                    <div key={name} className="space-y-1">
                        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                            {description || name}
                        </label>
                        <input
                            type="number"
                            id={name}
                            value={Number(value)}
                            onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Digite um número para ${name}`}
                        />
                    </div>
                );

            case "string":
            default:
                return (
                    <div key={name} className="space-y-1">
                        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                            {description || name}
                        </label>
                        <input
                            type="text"
                            id={name}
                            value={String(value)}
                            onChange={(e) => onChange(name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Digite um texto para ${name}`}
                        />
                    </div>
                );
        }
    };

    // Se não há inputs, não renderiza nada
    if (!inputs || inputs.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Nenhuma configuração disponível para este dispositivo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inputs.map(renderInput)}
                </div>
            </div>
        </div>
    );
}
