'use client'

import { useState } from 'react'
import { subscribeRequestSchema } from '@/types/notification.type'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, Loader2, Mail } from 'lucide-react'

interface SubscribeFormProps {
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function SubscribeForm({ onSuccess, onError }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [showResendOption, setShowResendOption] = useState(false)
  const [requiresVerification, setRequiresVerification] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Validate email using Zod schema
      const validation = subscribeRequestSchema.safeParse({ email })
      if (!validation.success) {
        throw new Error('אנא הזן כתובת מייל תקינה')
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
        
        // Handle different success scenarios
        if (data.alreadySubscribed) {
          setMessage('כבר נרשמת! תמשיך לקבל עדכונים מאל על.')
          setRequiresVerification(false)
        } else if (data.emailFailed) {
          setMessage('ההרשמה נוצרה אך לא הצלחנו לשלוח מייל אימות.')
          setIsSuccess(false) // Don't show success state
          setShowResendOption(true) // Show resend option
        } else if (data.requiresVerification) {
          setMessage('נרשמת בהצלחה! אנא בדוק את המייל שלך ולחץ על קישור האימות כדי להתחיל לקבל עדכונים.')
          setRequiresVerification(true)
        } else {
          setMessage(data.message || 'נרשמת בהצלחה!')
          setRequiresVerification(false)
        }
        
        setEmail('')
        onSuccess?.()
      } else {
        throw new Error(data.error || 'ההרשמה נכשלה')
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

  async function handleResendVerification() {
    setIsLoading(true)
    setMessage('')
    setShowResendOption(false)

    try {
      const response = await fetch('/api/subscription/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.alreadyVerified) {
          setIsSuccess(true)
          setRequiresVerification(false)
          setMessage('המייל כבר מאומת! תקבל עדכונים.')
        } else {
          setMessage('מייל אימות נשלח שוב. בדוק את תיבת הדואר שלך.')
        }
      } else {
        throw new Error(data.error || 'שליחה חוזרת נכשלה')
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      setMessage(errorMessage)
      setShowResendOption(true) // Show option again on failure
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-sm border-0 rounded-3xl shadow-2xl overflow-hidden">
        <div className="text-center pb-8 pt-8 px-8">
          <motion.div 
            className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Bell className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-3xl font-light text-gray-900 mb-3">
            עדכוני אל על
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto mb-4">
            קבל התראות מיידיות כשהאתר מתעדכן
          </p>
          <p className="text-indigo-600 text-sm font-medium mb-6">
            שירות חינמי כדי לעזור לכם לחזור הביתה בבטחה
          </p>
          
          {/* Link to multi-airline service */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-100">
            <div className="text-center">
              <p className="text-gray-700 text-sm mb-2">
                מחפשים עדכונים מחברות תעופה נוספות?
              </p>
              <a 
                href="https://hina-ani-ba.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                <span>קבל עדכונים מארקיע, ישראייר, מנו קרוז ואל על</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="px-8 pb-8">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                {requiresVerification ? (
                  <>
                    <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">כמעט מוכן!</h3>
                    <p className="text-gray-600 mb-2">אנא אמת את המייל שלך כדי להתחיל לקבל עדכונים</p>
                    <p className="text-sm text-gray-500">בדוק את תיבת הדואר שלך ולחץ על קישור האימות</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">הכל מוכן!</h3>
                    <p className="text-gray-600">נודיע לך כשיהיו עדכונים חדשים</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block text-right">
                    כתובת המייל שלך
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 h-12 bg-gray-50 border-0 focus:bg-white transition-colors rounded-xl text-right"
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                </div>

                {message && !isSuccess && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm text-right">{message}</p>
                    {showResendOption && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                      >
                        שלח מייל אימות שוב
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      רושם אותך...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Bell className="w-5 h-5" />
                      התחל לקבל עדכונים
                    </span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        {!isSuccess && (
          <div className="bg-gray-50 px-4 sm:px-8 py-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 w-full">
              <div className="flex items-center gap-3 sm:flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm font-medium">✓</span>
                </div>
                <div className="text-right flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">בדיקות כל 10 דקות</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm font-medium">✓</span>
                </div>
                <div className="text-right flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">ללא דואר זבל</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:flex-1">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm font-medium">✓</span>
                </div>
                <div className="text-right flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">ביטול בכל עת</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}