import React, { useState } from 'react';
import DeviceInputTable, { DeviceInput } from './DeviceInputTable';

// Exemplo de uso do DeviceInputTable
export default function DeviceInputTableExample() {
    // Exemplo de dados de inputs do device
    const [deviceInputs, setDeviceInputs] = useState<DeviceInput[]>([
        {
            name: "temperature",
            description: "Temperatura do Sensor",
            type: "number",
            value: 25.5
        },
        {
            name: "isEnabled",
            description: "Dispositivo Ativo",
            type: "boolean",
            value: true
        },
        {
            name: "deviceName",
            description: "Nome do Dispositivo",
            type: "string",
            value: "Sensor Principal"
        },
        {
            name: "threshold",
            description: "Limite de Temperatura",
            type: "number",
            value: 30
        },
        {
            name: "notifications",
            description: "Receber Notificações",
            type: "boolean",
            value: false
        }
    ]);

    const handleInputChange = (name: string, value: string | number | boolean) => {
        setDeviceInputs(prev => 
            prev.map(input => 
                input.name === name 
                    ? { ...input, value } 
                    : input
            )
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Exemplo de Tabela de Inputs do Device</h1>
            
            <DeviceInputTable
                inputs={deviceInputs}
                onChange={handleInputChange}
                title="Configurações do Sensor"
            />

            {/* Mostrar os valores atuais */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Valores Atuais:</h3>
                <pre className="text-sm">
                    {JSON.stringify(deviceInputs, null, 2)}
                </pre>
            </div>
        </div>
    );
}
