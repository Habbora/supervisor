"use client"

import { ConfigField } from "@/features/drivers/types/config-field.types";

interface DynamicConfigFieldProps {
    field: ConfigField;
    value: any;
    onChange?: (value: any) => void;
    isChanged?: boolean;
}

export function DynamicConfigField({ field, value, onChange, isChanged = false }: DynamicConfigFieldProps) {
    const displayValue = field.format ? field.format(value) : value;

    // ========== OUTPUTS (Read-only) ==========
    if (field.mode === 'output') {
        switch (field.type) {
            case 'status':
                const statusOption = field.options?.find(opt => opt.value === value);
                const statusColor = statusOption?.color || 'gray';
                const colorClasses = {
                    green: 'bg-green-100 text-green-800 border-green-200',
                    red: 'bg-red-100 text-red-800 border-red-200',
                    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    blue: 'bg-blue-100 text-blue-800 border-blue-200',
                    gray: 'bg-gray-100 text-gray-800 border-gray-200'
                };

                return (
                    <div className={`px-4 py-2.5 border-2 rounded-lg font-medium ${colorClasses[statusColor]}`}>
                        {statusOption?.label || displayValue || '-'}
                    </div>
                );

            case 'badge':
                return (
                    <div className="px-4 py-2.5 border-2 border-blue-200 rounded-lg bg-blue-50 text-blue-800 font-medium">
                        {displayValue || '-'}
                    </div>
                );

            default:
                return (
                    <div className="px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-mono">
                        {displayValue || '-'}
                    </div>
                );
        }
    }

    // ========== INPUTS (Editable) ==========
    const baseInputClasses = `w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors ${isChanged
        ? 'border-orange-400 bg-orange-50'
        : 'border-gray-200'
        }`;

    switch (field.type) {
        case 'string':
            return (
                <input
                    type="text"
                    value={value ?? field.defaultValue ?? ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className={baseInputClasses}
                />
            );

        case 'number':
            return (
                <input
                    type="number"
                    value={value ?? field.defaultValue ?? ''}
                    onChange={(e) => onChange?.(e.target.value ? parseInt(e.target.value) : '')}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    required={field.required}
                    className={baseInputClasses}
                />
            );

        case 'boolean':
            return (
                <div className="flex items-center h-[42px]">
                    <input
                        type="checkbox"
                        checked={value ?? field.defaultValue ?? false}
                        onChange={(e) => onChange?.(e.target.checked)}
                        className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                </div>
            );

        case 'select':
            return (
                <select
                    value={value ?? field.defaultValue ?? ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    required={field.required}
                    className={baseInputClasses}
                >
                    <option value="">Selecione...</option>
                    {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );

        case 'textarea':
            return (
                <textarea
                    value={value ?? field.defaultValue ?? ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    required={field.required}
                    className={baseInputClasses}
                />
            );

        default:
            return null;
    }
}
