import { getDb } from './index';
import { eq, and } from 'drizzle-orm';
import type { User, Session, NewUser, NewSession } from './schema';
import * as schema from './schema';

const db = getDb();

// User utilities
export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return user || null;
}

export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(schema.users).values(data).returning();
  return user;
}

export async function updateUser(id: number, data: Partial<NewUser>): Promise<User | null> {
  const [user] = await db
    .update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .returning();
  return user || null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
  return result.length > 0;
}

// Session utilities
export async function createSession(data: NewSession): Promise<Session> {
  const [session] = await db.insert(schema.sessions).values(data).returning();
  return session;
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.token, token))
    .limit(1);
  return session || null;
}

export async function getUserBySessionToken(token: string): Promise<(User & { session: Session }) | null> {
  const result = await db
    .select({
      user: schema.users,
      session: schema.sessions,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.token, token), eq(schema.sessions.status, 'active')))
    .limit(1);

  if (result.length === 0) return null;

  const { user, session } = result[0];
  return { ...user, session };
}

export async function updateSession(id: number, data: Partial<NewSession>): Promise<Session | null> {
  const [session] = await db
    .update(schema.sessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.sessions.id, id))
    .returning();
  return session || null;
}

export async function deleteSession(id: number): Promise<boolean> {
  const result = await db.delete(schema.sessions).where(eq(schema.sessions.id, id)).returning();
  return result.length > 0;
}

export async function deleteAllUserSessions(userId: number): Promise<boolean> {
  const result = await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId)).returning();
  return result.length > 0;
}