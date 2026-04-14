import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

export async function createUser(data: CreateUserDto) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  return { id: user.id, email: user.email, name: user.name };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}