import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

interface RegisterInput {
  email: string
  password: string
  name?: string
}

interface LoginInput {
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
    plan: string
  }
  token: string
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
      },
    })

    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
      token,
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      },
      token,
    }
  }

  async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    })
  }

  async validateToken(token: string): Promise<AuthResponse['user'] | null> {
    try {
      jwt.verify(token, this.JWT_SECRET)

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      })

      if (!session || session.expiresAt < new Date()) {
        return null
      }

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
        plan: session.user.plan,
      }
    } catch (error) {
      return null
    }
  }

  private generateToken(userId: string): string {
    const token = jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: '7d' })

    prisma.session.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return token
  }
}

export const authService = new AuthService()
