import { db, users } from '../../db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class UserService {
  async createUser(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [user] = await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
    }).returning();

    return user;
  }

  async findUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: string, data: { name?: string; email?: string; password?: string }) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const [user] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async deleteUser(id: string) {
    const [user] = await db.delete(users)
      .where(eq(users.id, id))
      .returning();

    return user;
  }
} 