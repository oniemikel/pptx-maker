import { GenerateForm } from '@/features/content/components/GenerateForm'

/**
 * Home page (FSD: feature/content/pages)
 * Server Component wrapper for the generate form.
 */

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>PPTX Generator</h1>
      <p>Fill in the form below to generate a meeting presentation.</p>
      <GenerateForm />
    </main>
  )
}
