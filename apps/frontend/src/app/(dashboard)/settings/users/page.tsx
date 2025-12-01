'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUsers } from '@/features/auth/hooks/useUsers';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User, UserCreate, UserRoles } from '@/types/entities/User';
import { FormSettingsAddUser } from '@/components/forms/form-settings-add-user';
import {
    Users,
    Search,
    Plus,
    UserCheck,
    Mail,
    Calendar,
    Edit,
    Trash2,
    Crown,
    Eye,
    CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function UsersPage() {
    const { token, user: currentUser } = useAuth();
    const { createUser, readUsers, updateUser, deleteUser } = useUsers();

    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'super' | 'admin' | 'user' | 'viewer'>('all');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (token) {
            readUsers(token).then(setUsers);
        }
    }, [token]);

    // Filtrar usuários
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Filtro por role
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => u.role === filterRole);
        }

        // Busca por nome, email ou username
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.username.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [users, filterRole, searchQuery]);

    const normalizeRole = (role: string) => UserRoles[role] || role;

    const stats = useMemo(() => {
        const total = users.length;
        const supers = users.filter(u => normalizeRole(u.role) === 'Super Adm.').length;
        const admins = users.filter(u => normalizeRole(u.role) === 'Administrador').length;
        const supervisors = users.filter(u => normalizeRole(u.role) === 'Supervisor').length;
        const operators = users.filter(u => normalizeRole(u.role) === 'Operador').length;
        return { total, supers, admins, supervisors, operators };
    }, [users]);

    const handleSubmitUser = async (userData: UserCreate) => {
        if (!token) return;

        try {
            if (editingUser) {
                // Editando usuário existente - converte para UserUpdate
                const updateData = {
                    name: userData.name,
                    role: userData.role,
                    ...(userData.password && { password: userData.password })
                };
                await updateUser(editingUser.id, updateData, token);
                handleOpenSuccessPopup('Usuário atualizado com sucesso!');
            } else {
                // Criando novo usuário
                if (userData.name && userData.username && userData.password) {
                    await createUser(userData, token);
                    handleOpenSuccessPopup('Usuário criado com sucesso!');
                }
            }

            handleCloseModal();
            readUsers(token).then(setUsers);
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!token) return;
        if (confirm('Tem certeza que deseja deletar este usuário?')) {
            console.log('Teste')
            const user = await deleteUser(id, token);
            console.log(user)
            readUsers(token).then(setUsers);
        }
    };

    const handleEditUser = async (user: User) => {
        setEditingUser(user)
        setIsAddUserOpen(true)
    };

    const handleCloseModal = () => {
        setIsAddUserOpen(false);
        setEditingUser(null);
    };

    const handleOpenSuccessPopup = (message: string, timeout: number = 3000) => {
        setSuccessMessage(message);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), timeout);
    }

    // Função para gerar iniciais do nome
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Função para formatar data com segurança
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Data não disponível';
            }
            return format(date, "dd/MM/yyyy");
        } catch (error) {
            return 'Data não disponível';
        }
    };

    // Função para cor do avatar baseada no role
    const getRoleColor = (role: string) => {
        const normalizedRole = normalizeRole(role);
        switch (normalizedRole) {
            case 'Administrador':
                return 'bg-gradient-to-br from-red-500 to-orange-500';
            case 'Supervisor':
                return 'bg-gradient-to-br from-blue-500 to-indigo-500';
            case 'Operador':
                return 'bg-gradient-to-br from-green-500 to-emerald-500';
            default:
                return 'bg-gradient-to-br from-gray-500 to-slate-500';
        }
    };

    // Função para badge do role
    const getRoleBadge = (role: string) => {
        const normalizedRole = normalizeRole(role);
        const configs = {
            'Administrador': { icon: Crown, color: 'bg-red-100 text-red-700 border-red-200' },
            'Supervisor': { icon: Eye, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'Operador': { icon: UserCheck, color: 'bg-green-100 text-green-700 border-green-200' },
        };

        const config = configs[normalizedRole as keyof typeof configs] || { icon: UserCheck, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {normalizedRole}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
                            <Users className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
                            <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Super Adm.</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.supers}</p>
                                </div>
                                <Crown className="w-8 h-8 text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-700">Administradores</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
                                </div>
                                <Crown className="w-8 h-8 text-red-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Supervisores</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.supervisors}</p>
                                </div>
                                <Eye className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Operadores</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.operators}</p>
                                </div>
                                <UserCheck className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou usuário..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                            />
                        </div>

                        {/* Filtros e Ações */}
                        <div className="flex gap-2 flex-wrap">
                            {/* Filtro de Role */}
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as any)}
                                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                            >
                                <option value="all">Todas as Funções</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Supervisor</option>
                                <option value="viewer">Operador</option>
                            </select>

                            {/* Botão Novo - Só para super e admin */}
                            {(currentUser?.role === 'super' || currentUser?.role === 'admin') && (
                                <Button
                                    onClick={() => setIsAddUserOpen(true)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md h-[42px] px-4 border-2 border-transparent my-auto"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Novo Usuário
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || filterRole !== 'all'
                                ? 'Nenhum usuário encontrado'
                                : 'Nenhum usuário cadastrado'
                            }
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || filterRole !== 'all'
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Adicione usuários para começar a gerenciar o sistema.'
                            }
                        </p>
                        {!searchQuery && filterRole === 'all' && (
                            <Button
                                onClick={() => setIsAddUserOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeiro Usuário
                            </Button>
                        )}
                    </div>
                )}

                {/* Users Grid */}
                {filteredUsers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Avatar e Nome */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-14 h-14 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">{user.name}</h3>
                                        <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                                    </div>
                                </div>

                                {/* Badge de Role */}
                                <div className="mb-4">
                                    {getRoleBadge(user.role)}
                                </div>

                                {/* Informações */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Criado em {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Ações - Só para super e admin */}
                                {(currentUser?.role === 'super' || currentUser?.role === 'admin') && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <Button
                                            onClick={() => handleEditUser(user)}
                                            variant="outline"
                                            className="flex-1 border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50"
                                            disabled={user.role === 'super' && currentUser?.role !== 'super'}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteUser(user.id)}
                                            variant="outline"
                                            className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                                            disabled={user.id === String(currentUser?.id) || user.role === 'super'}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Deletar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Info */}
                {filteredUsers.length > 0 && (
                    <div className="text-center text-sm text-gray-500">
                        Mostrando {filteredUsers.length} {searchQuery || filterRole !== 'all' ? `de ${users.length}` : ''} usuário(s)
                    </div>
                )}

            </div>

            {/* Modal Adicionar/Editar Usuário */}
            <Dialog open={isAddUserOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                        </DialogTitle>
                    </DialogHeader>
                    <FormSettingsAddUser
                        onUserSubmit={handleSubmitUser}
                        initialData={editingUser || undefined}
                    />
                </DialogContent>
            </Dialog>

            {/* Popup de Sucesso */}
            {showSuccessPopup && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-white rounded-xl shadow-2xl border-2 border-green-200 p-4 flex items-center gap-3 min-w-[320px]">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Sucesso!</h3>
                            <p className="text-sm text-gray-600">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
