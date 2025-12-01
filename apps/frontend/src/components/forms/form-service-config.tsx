import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateControllerDTO } from "@/features/controllers/types";
import { useState, useEffect } from "react";
import { Server, Network, Hash, Globe } from "lucide-react";

interface FormServiceConfigProps {
    onServiceSubmit: (service: CreateControllerDTO) => void;
    initialData?: CreateControllerDTO;
}

export function FormServiceConfig({ onServiceSubmit, initialData }: FormServiceConfigProps) {
    const [formData, setFormData] = useState<CreateControllerDTO>({
        name: "",
        type: "modbus-tcp",
        configs: {
            network: {
                host: "",
                port: 502
            }
        }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preencher form se estiver editando
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const updateField = (field: keyof CreateControllerDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo ao editar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateNetworkField = (field: 'host' | 'port', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            configs: {
                ...prev.configs,
                network: {
                    ...prev.configs?.network,
                    host: prev.configs?.network?.host || "",
                    port: prev.configs?.network?.port || 502,
                    [field]: value
                }
            }
        }));
        // Limpar erro do campo ao editar
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
        }

        if (!formData.configs?.network?.host.trim()) {
            newErrors.host = 'Endereço IP é obrigatório';
        } else {
            // Validação básica de IP
            const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (!ipPattern.test(formData.configs.network.host)) {
                newErrors.host = 'Endereço IP inválido (ex: 192.168.1.100)';
            }
        }

        const port = formData.configs?.network?.port;
        if (!port || port < 1 || port > 65535) {
            newErrors.port = 'Porta deve estar entre 1 e 65535';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        onServiceSubmit(formData);
    };

    const protocolTypes = [
        { value: 'modbus-tcp', label: 'Modbus TCP' },
        { value: 'modbus-rtu', label: 'Modbus RTU' },
        { value: 'modbus-udp', label: 'Modbus UDP' },
        { value: 'bacnet-ip', label: 'BACnet IP' },
        { value: 'mqtt', label: 'MQTT' },
        { value: 'socket', label: 'Socket' },
        { value: 'home-manager', label: 'Home Manager' },
        { value: 'absolute-control', label: 'Absolute Control' },
        { value: '7port', label: '7Port' },
        { value: 'scenario', label: 'Scenario' },
        { value: 'ocpp-server', label: 'OCPP Server' },
        { value: 'fieldbus', label: 'Fieldbus' },
        { value: 'control4', label: 'Control 4' },
        { value: 'savant', label: 'Savant' },
        { value: 'alexa', label: 'Alexa' },
        { value: 'google-home', label: 'Google Home' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome do Serviço */}
            <div>
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4" />
                    Nome do Serviço *
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Ex: CLP Principal"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`h-11 border-2 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Tipo de Protocolo */}
            <div>
                <Label htmlFor="type" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4" />
                    Tipo de Protocolo *
                </Label>
                <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="w-full h-11 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all bg-white text-gray-900 font-medium"
                >
                    {protocolTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Configurações de Rede */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Configurações de Rede
                </h3>

                {/* Endereço IP */}
                <div>
                    <Label htmlFor="host" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                        <Network className="w-4 h-4" />
                        Endereço IP *
                    </Label>
                    <Input
                        id="host"
                        type="text"
                        placeholder="Ex: 192.168.1.100"
                        value={formData.configs?.network?.host || ""}
                        onChange={(e) => updateNetworkField('host', e.target.value)}
                        className={`h-11 border-2 ${errors.host ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'}`}
                    />
                    {errors.host && <p className="mt-1 text-sm text-red-600">{errors.host}</p>}
                </div>

                {/* Porta */}
                <div>
                    <Label htmlFor="port" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Porta *
                    </Label>
                    <Input
                        id="port"
                        type="number"
                        placeholder="Ex: 502"
                        value={formData.configs?.network?.port || 502}
                        onChange={(e) => updateNetworkField('port', parseInt(e.target.value) || 502)}
                        min={1}
                        max={65535}
                        className={`h-11 border-2 ${errors.port ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'}`}
                    />
                    {errors.port && <p className="mt-1 text-sm text-red-600">{errors.port}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                        Porta padrão para Modbus TCP: 502
                    </p>
                </div>
            </div>

            {/* Botão Submit */}
            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg h-11"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Serviço'}
                </Button>
            </div>
        </form>
    );
}
