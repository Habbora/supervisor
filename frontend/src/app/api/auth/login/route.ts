import { NextRequest, NextResponse } from 'next/server';

// Usuários mockados (simulando banco de dados)
const USERS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user', 
    password: '123456',
    role: 'user'
  }
];

export async function POST(request: NextRequest) {
  try {
    // Pegar os dados do corpo da requisição
    const { username, password } = await request.json();

    // Validar se os campos existem
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = USERS.find(u => 
      u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário ou senha inválidos' },
        { status: 401 }
      );
    }

    // Criar token simples (em produção seria JWT)
    const token = `token_${user.id}_${Date.now()}`;

    // Retornar sucesso
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 