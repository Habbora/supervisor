import { db, users } from './index';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Verifica se já existe um usuário admin
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'admin')
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe');
      return;
    }

    // Cria o hash da senha
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Insere o usuário admin
    await db.insert(users).values({
      id: uuidv4(),
      name: 'Administrador',
      username: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Usuário admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

// Executa o seed
seed(); 