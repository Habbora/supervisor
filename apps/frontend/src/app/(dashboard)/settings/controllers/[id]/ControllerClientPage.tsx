"use client"

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useControllers } from "@/features/controllers/hooks/useControllers";
import { ControllerType, Endpoint } from "@/features/controllers/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Network,
    Wifi,
    WifiOff,
    Settings,
    Plus,
    Edit,
    Trash2,
} from "lucide-react";
import PopupShowComponent from "@/components/popup-show";
import { FormEndpoint } from "@/components/forms/FormEndpoint";
import { CreateEndpointDTO, UpdateEndpointDTO } from "@/features/controllers/types";
import ActionBar from "./ActionBar";
import { ControllerInfoBar } from "./ControllerInfoBar";
import { ControllerHeader } from "./ControllerHeader";
import { ControllerConfig } from "./ControllerConfig";

interface EditControllerFormProps {
    initialController: ControllerType;
    initialSchema: any;
}

export default function ControllerClientPage({ initialController, initialSchema }: EditControllerFormProps) {
    const router = useRouter();
    const {
        updateController,
        deleteController,
        createEndpoint,
        updateEndpoint,
        deleteEndpoint,
    } = useControllers();
    // Initialize state with props
    const [controller, setController] = useState<ControllerType>(initialController);

    // Form states
    const [name, setName] = useState(initialController.name);
    const [configs, setConfigs] = useState<Record<string, any>>(
        initialController.configs && typeof initialController.configs === 'object'
            ? initialController.configs
            : {}
    );
    const [hasChanges, setHasChanges] = useState(false);

    // Track original values for field highlighting
    const [originalName, setOriginalName] = useState(initialController.name)
    const [originalConfigs, setOriginalConfigs] = useState<Record<string, any>>(
        initialController.configs && typeof initialController.configs === 'object'
            ? initialController.configs
            : {}
    )

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState<'' | 'addEndpoint' | 'editEndpoint' | 'deleteController'>('')
    const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)

    // Popup
    const [popupMessage, setPopupMessage] = useState('')
    const [isPopupError, setIsPopupError] = useState(false)

    // Copy state
    const [isCopied, setIsCopied] = useState(false)

    const showPopup = (message: string, timeout: number = 3000, isError: boolean = false) => {
        setIsPopupError(isError);
        setPopupMessage(message);
        setTimeout(() => setPopupMessage(''), timeout);
    }

    // Check for changes
    useEffect(() => {
        const changed =
            name !== controller.name ||
            JSON.stringify(configs) !== JSON.stringify(controller.configs || {});

        setHasChanges(changed);
    }, [name, configs, controller]);

    // Handlers ActionBar
    const handleCancel = () => {
        setName(originalName);
        setConfigs(originalConfigs);
    }

    const handleSave = async () => {
        const success = await updateController(controller.id, {
            name,
            configs
        });

        if (success) {
            // Atualiza os valores originais após salvar
            setOriginalName(name);
            setOriginalConfigs(configs);
            setHasChanges(false);
            // Update local controller state to reflect saved changes
            setController(prev => ({ ...prev, name, configs }));
        } else {
            showPopup('Erro ao atualizar controlador', 3000, true);
        }
    }

    const handleDelete = async () => {
        const success = await deleteController(controller.id);
        if (success) {
            showPopup('Controlador removido com sucesso!');
            setTimeout(() => router.push('/settings/controllers'), 1000);
        } else {
            showPopup('Erro ao remover controlador', 3000, true);
        }
        setIsDialogOpen('');
    }

    // Handlers Copy
    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(controller.id);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            showPopup('Erro ao copiar ID', 3000, true);
        }
    }

    // Handlers Endpoints
    const handleAddEndpoint = () => {
        setSelectedEndpoint(null);
        setIsDialogOpen('addEndpoint');
    }

    const handleEditEndpoint = (endpoint: Endpoint) => {
        setSelectedEndpoint(endpoint);
        setIsDialogOpen('editEndpoint');
    }

    const handleSubmitEndpoint = async (data: CreateEndpointDTO) => {
        if (selectedEndpoint) {
            // Edit mode
            const success = await updateEndpoint(controller.id, selectedEndpoint.id, data as UpdateEndpointDTO);
            if (success) {
                showPopup('Endpoint atualizado com sucesso!');
                setIsDialogOpen('');
                setSelectedEndpoint(null);
                // Refresh controller data would be ideal here, but for now we rely on the hook or parent refresh
                // Since we are in client component, we might need to manually update local state or re-fetch
                // For simplicity, we can assume useControllers hook might update global cache or we can trigger a refresh
                // But since we passed initialController, we might need to update it.
                // However, useControllers likely uses SWR or React Query, so it might update automatically?
                // The original code relied on `useControllers` hook to fetch data, which updated the `controllers` list.
                // Here we are using `initialController`. 
                // To keep it simple and consistent with "Server Action" style, we might want to refresh the page
                router.refresh();
            } else {
                showPopup('Erro ao atualizar endpoint', 3000, true);
            }
        } else {
            // Add mode
            const success = await createEndpoint(controller.id, data);
            if (success) {
                showPopup('Endpoint adicionado com sucesso!');
                setIsDialogOpen('');
                router.refresh();
            } else {
                showPopup('Erro ao adicionar endpoint', 3000, true);
            }
        }
    }

    const handleDeleteEndpoint = async (endpointId: string) => {
        if (confirm('Tem certeza que deseja remover este endpoint?')) {
            const success = await deleteEndpoint(controller.id, endpointId);
            if (success) {
                showPopup('Endpoint removido com sucesso!');
                router.refresh();
            } else {
                showPopup('Erro ao remover endpoint', 3000, true);
            }
        }
    }

    const handleSaveConfig = (data: Record<string, any>) => {
        setConfigs(data)
        handleSave()
    }

    // Helper to check if a field has changed
    const isFieldChanged = (field: 'name' | string) => {
        if (field === 'name') {
            return name !== originalName;
        }
        // For config fields
        return configs[field] !== originalConfigs[field];
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <ControllerHeader controller={controller} />

                {/* Action Bar */}
                <ActionBar
                    handleReturn={() => router.push('/settings/controllers')}
                    handleCancel={handleCancel}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                    hasChanges={hasChanges}
                />

                {/* Section 1: Informações do Controlador */}
                <ControllerInfoBar
                    controller={controller}
                    name={name}
                    setName={setName}
                    isFieldChanged={isFieldChanged}
                    handleCopyId={handleCopyId}
                    isCopied={isCopied}
                />

                {/* Section 2: Configurações do Driver */}
                <ControllerConfig
                    controller={initialController}
                    schema={initialSchema}
                    onSave={handleSaveConfig}
                />

                {/* Section 3: Endpoints */}
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="w-6 h-6 text-cyan-600" />
                            <h2 className="text-xl font-bold text-gray-900">
                                Endpoints ({controller.endpoints?.length || 0})
                            </h2>
                        </div>
                        <Button
                            onClick={handleAddEndpoint}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Endpoint
                        </Button>
                    </div>

                    {controller.tags?.length > 0 ? (
                        <div className="space-y-3">
                            {controller.tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-cyan-300 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                                {tag.name}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                                    {tag.type}
                                                </span>
                                                {tag.description && (
                                                    <span className="text-gray-600">{tag.description}</span>
                                                )}
                                                {tag.unit && (
                                                    <span className="text-gray-500 font-medium">• {tag.unit}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditEndpoint(tag)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                                                title="Editar endpoint"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEndpoint(tag.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors border border-transparent hover:border-red-200"
                                                title="Remover endpoint"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum endpoint configurado
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Endpoints são pontos de leitura/escrita de dados no controlador.
                                Adicione endpoints para mapear as variáveis que deseja monitorar ou controlar.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogOpen === 'deleteController'} onOpenChange={() => setIsDialogOpen('')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Tem certeza que deseja deletar o controlador <strong>{controller.name}</strong>?
                        </p>
                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                                ⚠️ Atenção: Esta ação não pode ser desfeita!
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                Todos os <strong>{controller.endpoints?.length || 0} endpoints</strong> também serão removidos permanentemente.
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={() => setIsDialogOpen('')}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                            >
                                Sim, Deletar Permanentemente
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Endpoint Form */}
            {(isDialogOpen === 'addEndpoint' || isDialogOpen === 'editEndpoint') && (
                <FormEndpoint
                    endpoint={selectedEndpoint || undefined}
                    onSubmit={handleSubmitEndpoint}
                    onCancel={() => {
                        setIsDialogOpen('');
                        setSelectedEndpoint(null);
                    }}
                />
            )}

            <PopupShowComponent
                message={popupMessage}
                isError={isPopupError}
            />
        </div>
    );
}
