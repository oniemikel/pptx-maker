'use client'

import { useState } from 'react'
import { generatePptxAction } from '@/features/content/actions/generateAction'

/**
 * Minimal form component for PPTX generation.
 * - Collects date and 4 department fields
 * - Calls Server Action to generate PPTX
 * - Triggers browser download
 */

export function GenerateForm() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [ds, setDs] = useState<string>('')
  const [de, setDe] = useState<string>('')
  const [biz, setBiz] = useState<string>('')
  const [cc, setCc] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await generatePptxAction({
        date,
        ds,
        de,
        biz,
        cc,
      })

      if (!result.success) {
        setError(result.error || 'Generation failed')
        return
      }

      // Trigger download
      if (result.data) {
        const { base64, filename, mimeType } = result.data

        // Decode base64 to binary
        const binaryString = atob(base64)
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
        const blob = new Blob([bytes], { type: mimeType })

        // Create download link
        const downloadUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = downloadUrl
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(downloadUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleGenerate} className="generate-form">
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ds">Department S:</label>
        <textarea
          id="ds"
          value={ds}
          onChange={(e) => setDs(e.target.value)}
          disabled={loading}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="de">Department E:</label>
        <textarea
          id="de"
          value={de}
          onChange={(e) => setDe(e.target.value)}
          disabled={loading}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="biz">Business:</label>
        <textarea
          id="biz"
          value={biz}
          onChange={(e) => setBiz(e.target.value)}
          disabled={loading}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cc">CC:</label>
        <textarea
          id="cc"
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          disabled={loading}
          rows={5}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate PPTX'}
      </button>

      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .generate-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: bold;
        }

        input[type='date'],
        textarea {
          font-family: inherit;
          font-size: 1rem;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        textarea:disabled,
        input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover:not(:disabled) {
          background-color: #0051c3;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          padding: 1rem;
          background-color: #fee;
          color: #c33;
          border-radius: 4px;
        }
      `}</style>
    </form>
  )
}
