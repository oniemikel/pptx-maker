'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  GeneratePptxSchema,
  type GenerateActionState,
  initialGenerateActionState,
} from '@/features/content/model/schema'

/**
 * Server Action to call `/api/generate` endpoint.
 * This action validates input and calls the Python PPTX generator.
 */

export async function generatePptxAction(
  _previousState: GenerateActionState,
  formData: FormData,
): Promise<GenerateActionState> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')
  if (!authToken) {
    return {
      status: 'error',
      message: 'Unauthorized. Please login first.',
    }
  }

  let validated: z.infer<typeof GeneratePptxSchema>
  try {
    validated = GeneratePptxSchema.parse({
      date: formData.get('date'),
      ds: formData.get('ds') ?? '',
      de: formData.get('de') ?? '',
      biz: formData.get('biz') ?? '',
      cc: formData.get('cc') ?? '',
    })
  } catch (error) {
    const message =
      error instanceof z.ZodError ? error.errors[0].message : 'Validation failed'
    return {
      status: 'error',
      message,
    }
  }

  try {
    // Construct API URL
    // In Vercel: Next.js Server Actions can call relative `/api/generate`
    // In local dev: use http://localhost:3000/api/generate or /api/generate
    const apiUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''}/api/generate`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return {
        status: 'error',
        message: `Server returned ${response.status}: ${errorBody}`,
      }
    }

    // Get blob from response
    const blob = await response.blob()

    // Convert blob to base64 for client-side download
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    return {
      status: 'success',
      message: 'PPTX is ready. Click the download link below.',
      download: {
        filename: `meeting_${validated.date}.pptx`,
        base64,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      },
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export { initialGenerateActionState }
