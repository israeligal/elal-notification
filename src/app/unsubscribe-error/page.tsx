'use client'

import Link from 'next/link'

export default function UnsubscribeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Hebrew Content */}
          <div className="mb-8" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              שגיאה בביטול המנוי
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              מצטערים, התרחשה שגיאה בעת ביטול המנוי. ייתכן שהקישור שגוי או פג תוקפו.
            </p>
          </div>

          {/* English Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Unsubscribe Error
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Sorry, there was an error processing your unsubscribe request. The link may be invalid or expired.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/unsubscribe"
              className="inline-block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              נסה שוב | Try Again
            </Link>
            
            <Link 
              href="/"
              className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              חזור לעמוד הבית | Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 