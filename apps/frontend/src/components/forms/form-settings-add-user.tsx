import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, UserCreate, UserRoles } from "@/types/entities/User";
import { useState, useEffect } from "react";
import { Crown, Eye, UserCheck, Mail, Lock, User as UserIcon, AtSign } from "lucide-react";

interface FormSettingsAddUserProps {
    onUserSubmit: (user: UserCreate) => void;
    initialData?: User;
}

export function FormSettingsAddUser({ onUserSubmit, initialData }: FormSettingsAddUserProps) {
    const [formData, setFormData] = useState<UserCreate>({
        username: "",
        name: "",
        role: "user",
        password: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preencher form se estiver editando
    useEffect(() => {
        if (initialData) {
            setFormData({
                username: initialData.username,
                name: initialData.name,
                email: initialData.email,
                role: initialData.role,
                password: ""
            });
        }
    }, [initialData]);

    const updateField = (field: keyof UserCreate, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpar erro do campo ao editar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Usuário é obrigatório';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Usuário deve ter no mínimo 3 caracteres';
        }

        // Senha obrigatória apenas ao criar
        if (!initialData && !formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        onUserSubmit(formData);
    };

    const getRoleIcon = (role: string) => {
        switch (UserRoles[role]) {
            case 'Administrador':
                return Crown;
            case 'Supervisor':
                return Eye;
            case 'Operador':
                return UserCheck;
            default:
                return UserIcon;
        }
    };

    const getRoleColor = (role: string) => {
        switch (UserRoles[role]) {
            case 'Administrador':
                return 'bg-red-100 border-red-300 text-red-700';
            case 'Supervisor':
                return 'bg-blue-100 border-blue-300 text-blue-700';
            case 'Operador':
                return 'bg-green-100 border-green-300 text-green-700';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-700';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div>
                <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    Nome Completo *
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`h-11 border-2 ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
                <Label htmlFor="username" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <AtSign className="w-4 h-4" />
                    Nome de Usuário *
                </Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Ex: joao.silva"
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                    autoComplete="username"
                    disabled={!!initialData}
                    className={`h-11 border-2 ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'} ${initialData ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                {initialData && (
                    <p className="mt-1 text-xs text-gray-500">
                        O nome de usuário não pode ser alterado após a criação
                    </p>
                )}
            </div>

            {/* Função/Role */}
            {initialData?.role !== 'super' && (
                <div>
                    <Label className="text-gray-700 font-medium mb-3 block">
                        Função no Sistema *
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                        {['viewer', 'user', 'admin'].map((role) => {
                            const Icon = getRoleIcon(role);
                            const isSelected = formData.role === role;

                            return (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => updateField('role', role)}
                                    className={`
                                        p-3 rounded-lg border-2 font-medium transition-all flex flex-col items-center gap-2
                                        ${isSelected
                                            ? getRoleColor(role) + ' shadow-md'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs">{UserRoles[role]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Senha */}
            <div>
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    Senha {initialData ? '(deixe vazio para manter)' : '*'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder={initialData ? "••••••••" : "Mínimo 6 caracteres"}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    className={`h-11 border-2 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                {!initialData && (
                    <p className="mt-1 text-xs text-gray-500">
                        A senha deve ter no mínimo 6 caracteres
                    </p>
                )}
            </div>

            {/* Botão Submit */}
            <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-11"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
            </div>
        </form>
    );
}
