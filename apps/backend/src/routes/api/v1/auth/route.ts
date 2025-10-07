import { database } from "@/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const POST = async (req: any) => {
    if (!req.body) {
        return Response.json(
            { error: "Corpo da requisição ausente. Envie os dados no body em formato JSON." },
            { status: 400 }
        );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
        return Response.json(
            { error: "Username e senha são obrigatórios." },
            { status: 400 }
        );
    }

    const userService = database.userService;
    const user = userService.getUserByUsername(username);

    if (!user) {
        return Response.json(
            { error: "Usuário não encontrado." },
            { status: 404 }
        );
    }

    const isPasswordValid = await Bun.password.verify(password, user.password_hash);
    if (!isPasswordValid) {
        return Response.json(
            { error: "Senha incorreta." },
            { status: 401 }
        );
    }

    const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
    );

    return Response.json({
        message: "Login realizado com sucesso.",
        token: token,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role
        }
    }, { status: 200 });
};
