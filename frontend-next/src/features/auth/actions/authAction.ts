'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

/**
 * Server Action for password-based authentication.
 * Compares input password against ADMIN_PASSWORD environment variable.
 */

const PasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export async function loginPasswordAction(password: string) {
  try {
    const validated = PasswordSchema.parse({ password })

    // Get admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in environment')
      return {
        success: false,
        error: 'Server configuration error',
      }
    }

    // Compare passwords
    if (validated.password !== adminPassword) {
      return {
        success: false,
        error: 'Invalid password',
      }
    }

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return {
      success: true,
    }
  } catch (error) {
    const errorMsg = error instanceof z.ZodError ? error.errors[0].message : 'Validation failed'
    return {
      success: false,
      error: errorMsg,
    }
  }
}

/**
 * Server Action to check if user is authenticated.
 */
export async function checkAuthAction() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    return {
      isAuthenticated: !!authToken,
    }
  } catch {
    return {
      isAuthenticated: false,
    }
  }
}

/**
 * Server Action to logout (clear auth cookie).
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    }
  }
}
