'use client'

import { useState } from 'react'
import { subscribeRequestSchema } from '@/types/notification.type'

interface SubscribeFormProps {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function SubscribeForm({ onSuccess, onError }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Validate email using Zod schema
      const validation = subscribeRequestSchema.safeParse({ email })
      if (!validation.success) {
        throw new Error('Please enter a valid email address')
      }

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message || 'Successfully subscribed! Please check your email to verify.')
        setEmail('')
        onSuccess?.()
      } else {
        throw new Error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setMessage(errorMessage)
      setIsSuccess(false)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            כתובת מייל | Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              שולח... | Subscribing...
            </span>
          ) : (
            'הרשם לעדכונים | Subscribe to Updates'
          )}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg text-sm ${
            isSuccess
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 leading-relaxed">
        <p className="mb-2">
          <strong>מה תקבל:</strong> עדכונים מיידיים על שינויים באתר אל על, הודעות על טיסות ושירותים
        </p>
        <p>
          <strong>What you&apos;ll receive:</strong> Immediate updates about changes on El Al website, flight and service notifications
        </p>
      </div>
    </div>
  )
}