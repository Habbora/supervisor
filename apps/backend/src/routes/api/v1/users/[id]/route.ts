import { database } from "@/database";
import { UserDatabase } from "../../../../../services/database/users";

export const GET = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;
        const userId = Number(id);

        if (Number.isNaN(userId)) {
            return Response.json({
                error: "Invalid user ID",
                message: "User ID must be a number"
            }, { status: 400 });
        }

        if (!id) {
            return Response.json({
                error: "Missing user ID",
                message: "User ID is required"
            }, { status: 400 });
        }

        const user = database.userService.getUserById(userId);

        if (!user) {
            return Response.json({
                error: "User not found",
                message: "User with this ID does not exist"
            }, { status: 404 });
        }

        const { password_hash: _, ...userData } = user;

        return Response.json(userData);
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: error
        }, { status: 500 });
    }
}

// PUT /api/v1/users/[id] - Atualizar usuário por ID
export const PUT = async (req: Request & { params: Record<string, string> }) => {
    try {
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing user ID",
                message: "User ID is required"
            }, { status: 400 });
        }

        const body = await req.json();
        const { name, email, role } = body;

        // Verifica se o usuário existe
        const existingUser = UserDatabase.getInstance().findById(id);
        if (!existingUser) {
            return Response.json({
                error: "User not found",
                message: "User with this ID does not exist"
            }, { status: 404 });
        }

        // Atualiza apenas os campos fornecidos
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;

        const updatedUser = UserDatabase.getInstance().updatePartial(id, updateData);

        if (!updatedUser) {
            return Response.json({
                error: "Update failed",
                message: "Failed to update user"
            }, { status: 400 });
        }

        // Remove a senha antes de retornar
        const { password: _, ...userData } = updatedUser;

        return Response.json(userData);
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: "Failed to update user"
        }, { status: 500 });
    }
}

// DELETE /api/v1/users/[id] - Deletar usuário por ID
export const DELETE = async (req: Request & { params: Record<string, string> }) => {
    try {
        console.log('params', req);
        const { id } = req.params;

        if (!id) {
            return Response.json({
                error: "Missing user ID",
                message: "User ID is required"
            }, { status: 400 });
        }

        // Verifica se o usuário existe
        const existingUser = UserDatabase.getInstance().findById(id);
        if (!existingUser) {
            return Response.json({
                error: "User not found",
                message: "User with this ID does not exist"
            }, { status: 404 });
        }

        const deletedUser = UserDatabase.getInstance().delete(id);

        if (!deletedUser) {
            return Response.json({
                error: "Delete failed",
                message: "Failed to delete user"
            }, { status: 400 });
        }

        // Remove a senha antes de retornar
        const { password: _, ...userData } = deletedUser;

        return Response.json({
            message: "User deleted successfully",
            user: userData
        });
    } catch (error) {
        return Response.json({
            error: "Internal server error",
            message: "Failed to delete user"
        }, { status: 500 });
    }
}
