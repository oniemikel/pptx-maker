'use client'

import { useActionState } from 'react'
import {
  generatePptxAction,
  initialGenerateActionState,
} from '@/features/content/actions/generateAction'
import { type GeneratePptxInput } from '@/features/content/model/schema'

/**
 * Minimal form component for PPTX generation.
 * - Collects date and 4 department fields
 * - Calls Server Action to generate PPTX
 * - Triggers browser download
 */

type GenerateFormProps = {
  initialValues: GeneratePptxInput
}

export function GenerateForm({ initialValues }: GenerateFormProps) {
  const [state, formAction, isPending] = useActionState(
    generatePptxAction,
    initialGenerateActionState,
  )

  return (
    <form action={formAction} className="generate-form">
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={initialValues.date}
          disabled={isPending}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ds">Department S:</label>
        <textarea
          id="ds"
          name="ds"
          defaultValue={initialValues.ds}
          disabled={isPending}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="de">Department E:</label>
        <textarea
          id="de"
          name="de"
          defaultValue={initialValues.de}
          disabled={isPending}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="biz">Business:</label>
        <textarea
          id="biz"
          name="biz"
          defaultValue={initialValues.biz}
          disabled={isPending}
          rows={5}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cc">CC:</label>
        <textarea
          id="cc"
          name="cc"
          defaultValue={initialValues.cc}
          disabled={isPending}
          rows={5}
        />
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Generating...' : 'Generate PPTX'}
      </button>

      {state.status === 'error' && <div className="error-message">{state.message}</div>}

      {state.status === 'success' && state.download && (
        <div className="success-message">
          <p>{state.message}</p>
          <a
            href={`data:${state.download.mimeType};base64,${state.download.base64}`}
            download={state.download.filename}
          >
            Download generated PPTX
          </a>
        </div>
      )}

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

        .success-message {
          padding: 1rem;
          background-color: #eef8ee;
          color: #215c21;
          border-radius: 4px;
        }

        .success-message a {
          color: #0f4d0f;
          font-weight: 600;
          text-decoration: underline;
        }
      `}</style>
    </form>
  )
}
