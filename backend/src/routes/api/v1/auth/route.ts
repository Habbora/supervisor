import { db, users } from '../../../../db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const GET = async (req: any) => {
  return new Response("Autenticação 2 de rota GET");
};

export const POST = async (req: any) => {
  try {
    const { username, password } = await req.json();

    // Busca o usuário no banco de dados
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404 }
      );
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Senha inválida' }),
        { status: 401 }
      );
    }

    // Retorna os dados do usuário (exceto a senha)
    const { password: _, ...userWithoutPassword } = user;
    return new Response(
      JSON.stringify({ user: userWithoutPassword }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao autenticar usuário' }),
      { status: 500 }
    );
  }
};
