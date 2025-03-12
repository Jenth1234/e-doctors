import { User } from '@/payload-types'
import type { Permissions } from 'payload'

import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next'
import { Socket as SocketIOServer } from 'socket.io'

// Socket IO Types
export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

// Payload Types
export type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<User>

export type ForgotPassword = (args: { email: string }) => Promise<User>

export type Create = (args: {
  name: string
  email: string
  password: string
}) => Promise<User | string>

export type Login = (args: { email: string; password: string }) => Promise<User>

export type Logout = () => Promise<void>

export interface AuthContext {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  permissions?: null | Permissions
  resetPassword: ResetPassword
  setPermissions: (permissions: null | Permissions) => void
  setUser: (user: null | User) => void
  user?: null | User
}
