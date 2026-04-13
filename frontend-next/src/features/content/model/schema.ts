import { z } from 'zod'

export const GeneratePptxSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  ds: z.string().max(8000, 'Department S is too long').default(''),
  de: z.string().max(8000, 'Department E is too long').default(''),
  biz: z.string().max(8000, 'Business section is too long').default(''),
  cc: z.string().max(8000, 'CC section is too long').default(''),
})

export type GeneratePptxInput = z.infer<typeof GeneratePptxSchema>

export type GenerateActionState = {
  status: 'idle' | 'error' | 'success'
  message: string
  download?: {
    filename: string
    base64: string
    mimeType: string
  }
}

export const initialGenerateActionState: GenerateActionState = {
  status: 'idle',
  message: '',
}
