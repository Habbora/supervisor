"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Endpoint,
    CreateEndpointDTO,
    ENDPOINT_TYPES,
    EndpointTypeEnum,
    EndpointConfig
} from "@/features/controllers/types";
import { X } from "lucide-react";

interface FormEndpointProps {
    endpoint?: Endpoint; // Se fornecido, é modo edição
    onSubmit: (data: CreateEndpointDTO) => void;
    onCancel: () => void;
}

export function FormEndpoint({ endpoint, onSubmit, onCancel }: FormEndpointProps) {
    const isEditMode = !!endpoint;

    // Form state
    const [name, setName] = useState(endpoint?.name || '');
    const [type, setType] = useState<EndpointTypeEnum>(endpoint?.type || 'digital_output');
    const [description, setDescription] = useState(endpoint?.description || '');
    const [unit, setUnit] = useState(endpoint?.unit || '');

    // Config fields (específicos para Modbus)
    const [address, setAddress] = useState<number>(0);
    const [functionCode, setFunctionCode] = useState<number>(3);
    const [dataType, setDataType] = useState<string>('uint16');
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<number>(0);

    // Load config values if editing
    useEffect(() => {
        if (endpoint?.configs && typeof endpoint.configs === 'object') {
            const config = endpoint.configs as EndpointConfig;
            setAddress(config.address || 0);
            setFunctionCode(config.function || 3);
            setDataType(config.dataType || 'uint16');
            setScale(config.scale || 1);
            setOffset(config.offset || 0);
        }
    }, [endpoint]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const configs: EndpointConfig = {
            address,
            function: functionCode,
            dataType,
            scale,
            offset
        };

        const data: CreateEndpointDTO = {
            name,
            type,
            configs,
            description: description || undefined,
            unit: unit || undefined
        };

        onSubmit(data);
    };

    const getEndpointTypeLabel = (type: EndpointTypeEnum) => {
        const labels: Record<EndpointTypeEnum, string> = {
            'digital_output': 'Saída Digital (DO)',
            'digital_input': 'Entrada Digital (DI)',
            'analog_input': 'Entrada Analógica (AI)',
            'analog_output': 'Saída Analógica (AO)'
        };
        return labels[type];
    };

    const getFunctionCodeLabel = (type: EndpointTypeEnum) => {
        const labels: Record<EndpointTypeEnum, string> = {
            'digital_output': 'Coil (FC 01/05/15)',
            'digital_input': 'Discrete Input (FC 02)',
            'analog_input': 'Input Register (FC 04)',
            'analog_output': 'Holding Register (FC 03/06/16)'
        };
        return labels[type];
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Endpoint' : 'Adicionar Endpoint'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Endpoint <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Temperatura Estufa 1"
                                    required
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as EndpointTypeEnum)}
                                    required
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                >
                                    {ENDPOINT_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {getEndpointTypeLabel(t)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unidade
                                </label>
                                <input
                                    type="text"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    placeholder="Ex: °C, %, kW"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descrição opcional do endpoint"
                                    rows={2}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Configuração Modbus */}
                    <div className="space-y-4 border-t-2 border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900">Configuração Modbus</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Endereço <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={address}
                                    onChange={(e) => setAddress(parseInt(e.target.value) || 0)}
                                    min={0}
                                    max={65535}
                                    required
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-xs text-gray-500 mt-1">Endereço Modbus (0-65535)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Function Code
                                </label>
                                <input
                                    type="number"
                                    value={functionCode}
                                    onChange={(e) => setFunctionCode(parseInt(e.target.value) || 3)}
                                    min={1}
                                    max={16}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-xs text-gray-500 mt-1">{getFunctionCodeLabel(type)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Dado
                                </label>
                                <select
                                    value={dataType}
                                    onChange={(e) => setDataType(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                >
                                    <option value="uint16">UInt16 (16-bit unsigned)</option>
                                    <option value="int16">Int16 (16-bit signed)</option>
                                    <option value="uint32">UInt32 (32-bit unsigned)</option>
                                    <option value="int32">Int32 (32-bit signed)</option>
                                    <option value="float32">Float32 (32-bit float)</option>
                                    <option value="bool">Boolean</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Escala
                                </label>
                                <input
                                    type="number"
                                    value={scale}
                                    onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-xs text-gray-500 mt-1">Multiplicador do valor lido</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Offset
                                </label>
                                <input
                                    type="number"
                                    value={offset}
                                    onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Valor adicionado após aplicar a escala: valor_final = (valor_lido × escala) + offset
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Dica:</strong> Para sensores de temperatura que retornam valores em décimos de grau
                            (ex: 235 = 23.5°C), use escala = 0.1
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end border-t-2 border-gray-200 pt-6">
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="border-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                        >
                            {isEditMode ? 'Salvar Alterações' : 'Adicionar Endpoint'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
