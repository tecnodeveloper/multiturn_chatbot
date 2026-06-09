import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

// Chat schemas
export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.date(),
})

export const conversationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Export types
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type Conversation = z.infer<typeof conversationSchema>
