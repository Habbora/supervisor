import { ControllerType } from "@/features/controllers/types";
import { Info, Check, Copy, Package } from "lucide-react";

interface ControllerInfoBarProps {
    controller: ControllerType;
    name: string;
    setName: (name: string) => void;
    isFieldChanged: (field: string) => boolean;
    handleCopyId: () => void;
    isCopied: boolean;
}

export function ControllerInfoBar({ controller, name, setName, isFieldChanged, handleCopyId, isCopied }: ControllerInfoBarProps) {



    return (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Info className="w-6 h-6 text-cyan-600" />
                <h2 className="text-xl font-bold text-gray-900">Informações do Controlador</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Controlador
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors ${isFieldChanged('name')
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200'
                            }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Nome descritivo para identificação</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID do Controlador
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={controller.id}
                            disabled
                            className="w-full px-4 py-2.5 pr-12 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <button
                            onClick={handleCopyId}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Copiar ID"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {isCopied ? 'ID copiado!' : 'Identificador único do sistema'}
                    </p>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Tipo de Driver
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={controller.driver}
                            disabled
                            className="w-full px-4 py-2.5 pr-12 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Não pode ser alterado após criação
                    </p>
                </div>
            </div>
        </div>
    )
}