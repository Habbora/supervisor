import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateControllerDTO, ControllerType } from "@/features/controllers/types";
import { useState, useEffect } from "react";
import { Server, Network } from "lucide-react";

interface FormAddControllerProps {
    onServiceSubmit: (service: CreateControllerDTO) => void;
    initialData?: ControllerType;
    availableDrivers?: { type: string, name: string, description: string }[];
}

export function FormAddController({ onServiceSubmit, initialData, availableDrivers = [] }: FormAddControllerProps) {
    const [formData, setFormData] = useState<CreateControllerDTO>({
        name: '',
        driver: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: keyof CreateControllerDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Nome muito longo (máximo 50 caracteres)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('AAA')

        if (!validate()) {
            console.log('Error Validade')
            return;
        }

        console.log('BBB')

        onServiceSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome do Controlador */}
            <div>
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4" />
                    Nome do Controlador *
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Ex: CLP Principal, Arduino Estufa 1"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`h-11 border-2 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'}`}
                    maxLength={50}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                <p className="mt-1 text-xs text-gray-500">
                    Identificação única do controlador no sistema
                </p>
            </div>

            {/* Tipo de Driver */}
            <div>
                <Label htmlFor="driver" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4" />
                    Driver de Controladores *
                </Label>
                {availableDrivers.length > 0 ? (
                    <>
                        <select
                            id="driver"
                            value={formData.driver}
                            onChange={(e) => updateField('driver', e.target.value)}
                            className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all bg-white text-gray-900 font-medium"
                        >
                            <option value=''>Selecione um driver</option>
                            {availableDrivers.map((driver) => (
                                <option key={driver.type} value={driver.type}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Selecione o driver de controladores instalado no sistema
                        </p>
                    </>
                ) : (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            ⚠️ Nenhum driver disponível. Instale drivers de controladores primeiro.
                        </p>
                    </div>
                )}
            </div>

            {/* Botão Submit */}
            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <Button
                    type="submit"
                    disabled={availableDrivers.length === 0}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Controlador'}
                </Button>
            </div>

            {!initialData && availableDrivers.length > 0 && (
                <p className="text-xs text-gray-500 text-center">
                    💡 Você poderá configurar os parâmetros de conexão (IP, porta, etc.) após criar o controlador
                </p>
            )}
        </form>
    );
}
