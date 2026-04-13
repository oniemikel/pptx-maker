import { GenerateForm } from '@/features/content/components/GenerateForm'
import { type GeneratePptxInput } from '@/features/content/model/schema'

/**
 * Home page (FSD: feature/content/pages)
 * Server Component wrapper for the generate form.
 */

export default function HomePage() {
  const initialValues: GeneratePptxInput = {
    date: new Date().toISOString().slice(0, 10),
    ds: '',
    de: '',
    biz: '',
    cc: '',
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>PPTX Generator</h1>
      <p>Fill in the form below to generate a meeting presentation.</p>
      <GenerateForm initialValues={initialValues} />
    </main>
  )
}
