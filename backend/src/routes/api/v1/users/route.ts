import { UserDatabase } from "../../../../services/database/users";
import { UserRoles } from "../../../../services/database/users/schema";

// GET /api/v1/users - Listar todos os usuários
export const GET = async () => {
    const users = UserDatabase.getInstance().findAll().map(user => {
        const { password: _, ...userData } = user;
        return userData;
    });
    return Response.json(users);
}

// POST /api/v1/users - Criar novo usuário
export const POST = async (req: Request) => {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return Response.json({
                error: "Missing required fields",
                message: "name, email, password and role are required"
            }, { status: 400 });
        }

        if (!Object.values(UserRoles).includes(role)) {
            return Response.json({
                error: "Invalid role",
                message: "Role must be admin or user"
            }, { status: 400 });
        }

        if (UserDatabase.getInstance().findByEmail(email)) {
            return Response.json({
                error: "User already exists",
                message: "User with this email already exists"
            }, { status: 400 });
        }

        const newUser = UserDatabase.getInstance().create({ name, email, password, role });

        if (!newUser) {
            return Response.json({
                error: "Error creating user",
                message: "Failed to create user. Please check the data sent."
            }, { status: 400 });
        }

        const { password: _, ...userData } = newUser;

        return Response.json(userData, { status: 201 });
    } catch (error) {
        return Response.json({ error: error }, { status: 500 });
    }
}
