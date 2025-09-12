import { UserDatabase } from "../../../../services/database/users";

export const POST = async (req: any) => {
    if (!req.body) {
        return Response.json(
            { error: "Corpo da requisição ausente. Envie os dados no body em formato JSON." },
            { status: 400 }
        );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
        return Response.json(
            { error: "Email e senha são obrigatórios." },
            { status: 400 }
        );
    }

    const user = UserDatabase.getInstance().findByEmail(email);

    if (!user) {
        return Response.json(
            { error: "Usuário não encontrado." },
            { status: 404 }
        );
    }

    if (user.password !== password) {
        return Response.json(
            { error: "Senha incorreta." },
            { status: 401 }
        );
    }

    return Response.json({
        message: "Login realizado com sucesso.",
        token: "token",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    }, { status: 200 });
};
