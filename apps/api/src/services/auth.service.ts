import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { prisma } from '../lib/prisma'
import { config } from '../config'

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
    avatar_url: string | null
    plan: string
  }
  token: string
}

export class AuthService {
  private get jwtSecret(): string {
    if (!config.jwt.secret) {
      throw new Error('JWT_SECRET is not configured')
    }
    return config.jwt.secret
  }

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
        id: crypto.randomUUID(),
        email: input.email,
        password_hash: passwordHash,
        name: input.name,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    const token = await this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
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

    const isValidPassword = await bcrypt.compare(input.password, user.password_hash)

    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    })

    const token = await this.generateToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
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
      jwt.verify(token, this.jwtSecret)

      const session = await prisma.session.findUnique({
        where: { token },
        include: { User: true },
      })

      if (!session || session.expires_at < new Date()) {
        return null
      }

      return {
        id: session.User.id,
        email: session.User.email,
        name: session.User.name,
        avatar_url: session.User.avatar_url,
        plan: (session.User as any).plan,
      }
    } catch (error) {
      return null
    }
  }

  private async generateToken(userId: string): Promise<string> {
    const token = jwt.sign({ userId }, this.jwtSecret, { expiresIn: config.jwt.expiresIn as any })

    await prisma.session.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return token
  }
}

export const authService = new AuthService()
