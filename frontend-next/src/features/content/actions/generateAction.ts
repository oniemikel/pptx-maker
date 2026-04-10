'use server'

import { z } from 'zod'

/**
 * Server Action to call `/api/generate` endpoint.
 * This action validates input and calls the Python PPTX generator.
 */

const GeneratePptxSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  ds: z.string().optional().default(''),
  de: z.string().optional().default(''),
  biz: z.string().optional().default(''),
  cc: z.string().optional().default(''),
})

export async function generatePptxAction(formData: z.infer<typeof GeneratePptxSchema>) {
  // Validate input
  let validated: z.infer<typeof GeneratePptxSchema>
  try {
    validated = GeneratePptxSchema.parse(formData)
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors[0].message : 'Validation failed',
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
        success: false,
        error: `Server returned ${response.status}: ${errorBody}`,
      }
    }

    // Get blob from response
    const blob = await response.blob()

    // Convert blob to base64 for client-side download
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    return {
      success: true,
      data: {
        filename: `meeting_${validated.date}.pptx`,
        base64: base64,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
