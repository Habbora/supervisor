import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface ActionBarProps {
    handleReturn: () => void;
    handleCancel: () => void;
    handleSave: () => void;
    handleDelete: () => void;
    hasChanges: boolean;
}

export default function ActionBar({ handleReturn, handleCancel, handleSave, handleDelete, hasChanges }: ActionBarProps) {
    return (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <Button
                    onClick={handleReturn}
                    variant="outline"
                    className="border-2 h-11"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>

                <div className="flex gap-2">
                    <Button
                        onClick={handleCancel}
                        disabled={!hasChanges}
                        variant="outline"
                        className="border-2 h-11"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>

                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        className="h-11 text-white"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                    </Button>
                </div>
            </div>
        </div>
    )
}