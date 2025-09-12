"use client";

import { useEffect, useState } from "react";
import ModernHeader from "@/components/modern/modern-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/features/authentication/hooks/useUsers";

// Tipo para usuário
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

// Dados de exemplo
const mockUsers: User[] = [
    {
        id: "1",
        name: "João Silva",
        email: "joao@exemplo.com",
        role: "Administrador",
        createdAt: "2024-01-15"
    },
    {
        id: "2",
        name: "Maria Santos",
        email: "maria@exemplo.com",
        role: "Usuário",
        createdAt: "2024-01-20"
    }
];

export default function UsersPage() {
    const { createUser, readUsers, deleteUser } = useUsers();

    const [users, setUsers] = useState<User[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingPassword, setEditingPassword] = useState<string | null>(null);

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "user",
        password: ""
    });

    const updateUsers = async () => {
        const users = await readUsers();
        console.log(users);
        setUsers(users);
    }

    useEffect(() => {
        updateUsers();
    }, []);

    // Adicionar novo usuário
    const handleAddUser = async () => {
        if (newUser.name && newUser.email && newUser.password) {
            const user = await createUser(newUser);
            setNewUser({ name: "", email: "", role: "user", password: "" });
            setIsAddingUser(false);
            updateUsers();
        }
    };

    // Deletar usuário
    const handleDeleteUser = async (id: string) => {
        if (confirm("Tem certeza que deseja deletar este usuário?")) {
            const response = await deleteUser(id);
            if (response) {
                updateUsers();
            }
        }
    };

    // Editar senha
    const handleEditPassword = (id: string, newPassword: string) => {
        if (newPassword) {
            alert("Senha atualizada com sucesso!");
            setEditingPassword(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <ModernHeader title="⚙️ Configurações" subtitle="Usuários" />

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gerenciar Usuários</CardTitle>
                        <Button
                            onClick={() => setIsAddingUser(!isAddingUser)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isAddingUser ? "Cancelar" : "+ Adicionar Usuário"}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Formulário para adicionar usuário */}
                    {isAddingUser && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddUser();
                            }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
                        >
                            <div>
                                <Label>Nome</Label>
                                <Input
                                    type="text"
                                    placeholder="Nome completo"
                                    value={newUser.name}
                                    autoComplete="name"
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    autoComplete="email"
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Função</Label>
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                    value={newUser.role}
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            <div>
                                <Label>Senha</Label>
                                <Input
                                    type="password"
                                    placeholder="Senha"
                                    value={newUser.password}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="md:col-span-4 bg-green-600 hover:bg-green-700"
                            >
                                Salvar Usuário
                            </Button>
                        </form>
                    )}


                    {/* Tabela de usuários usando HTML básico */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Nome</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Função</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Criado em</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'Administrador'
                                                ? 'bg-red-100 text-red-800'
                                                : user.role === 'Supervisor'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{user.createdAt}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <div className="flex gap-2">
                                                {editingPassword === user.id ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="password"
                                                            placeholder="Nova senha"
                                                            className="w-32"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const input = e.target as HTMLInputElement;
                                                                    handleEditPassword(user.id, input.value);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => setEditingPassword(null)}
                                                            variant="outline"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setEditingPassword(user.id)}
                                                        variant="outline"
                                                        className="text-blue-600"
                                                    >
                                                        Editar Senha
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    Deletar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhum usuário encontrado. Adicione o primeiro usuário!
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}