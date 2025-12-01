import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, AlertCircle, Save } from "lucide-react";
import { generateZodSchema, JsonSchema, extractUiMetadata } from "@/utils/schema-converter";
import { Button } from "@/components/ui/button";
import { ControllerType } from "@/features/controllers/types";

interface ControllerSchemaProps {
    controller: ControllerType
    schema?: JsonSchema
    onSave?: (data: Record<string, any>) => void
}

export function ControllerConfig({ controller, schema, onSave }: ControllerSchemaProps) {

    const zodSchema = useMemo(() => {
        if (!schema || schema.type !== 'object' || !schema.properties) return null;
        return generateZodSchema(schema);
    }, [schema]);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        reset
    } = useForm({
        resolver: zodSchema ? zodResolver(zodSchema) : undefined,
        values: controller.configs,
        mode: "onChange"
    });

    const handleCancel = () => {
        reset()
    }

    const onSubmit = (formData: Record<string, any>) => {
        onSave?.(formData)
    }

    if (!schema || schema.type !== 'object' || !schema.properties) {
        return (
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Settings className="w-6 h-6 text-cyan-600" />
                    <h2 className="text-xl font-bold text-gray-900">Configurações do Driver</h2>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Nenhuma configuração disponível para este driver.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center mb-6 justify-between">
                <div className="flex gap-2">
                    <Settings className="w-6 h-6 text-cyan-600" />
                    <h2 className="text-xl font-bold text-gray-900">Configurações do Driver</h2>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleCancel}
                        disabled={!isDirty}
                        variant="outline"
                        className="border-2 h-11"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isDirty || !isValid}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(schema.properties).map(([key, prop]) => {
                    const isRequired = schema.required?.includes(key);
                    const ui = extractUiMetadata(prop.description);
                    const label = ui.label || prop.title || key;
                    const description = ui.description || (ui.label ? undefined : prop.description); // If description was parsed as UI, use inner description, else use raw description if not parsed

                    return (
                        <div key={key} className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {label}
                                {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            {prop.type === 'boolean' ? (
                                <div className="flex items-center h-10">
                                    <Controller
                                        name={key}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <input
                                                type="checkbox"
                                                checked={!!value}
                                                onChange={(e) => onChange(e.target.checked)}
                                                className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                            />
                                        )}
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Habilitado</span>
                                </div>
                            ) : prop.enum ? (
                                <select
                                    {...register(key)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {prop.enum.map((opt: any) => (
                                        <option
                                            key={opt}
                                            value={opt}
                                        >
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={prop.type === 'number' || prop.type === 'integer' ? 'number' : 'text'}
                                    placeholder={ui.placeholder}
                                    {...register(key, {
                                        valueAsNumber: prop.type === 'number' || prop.type === 'integer'
                                    })}
                                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors ${errors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                />
                            )}

                            {errors[key] && (
                                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors[key]?.message as string}
                                </p>
                            )}

                            {description && (
                                <p className="text-xs text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}