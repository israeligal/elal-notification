import Link from 'next/link'

export default function VerificationErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Hebrew Content */}
          <div className="mb-8" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              שגיאה באימות המייל
            </h1>
            <p className="text-gray-600 leading-relaxed">
              לא הצלחנו לאמת את כתובת המייל שלך.
              <br />
              ייתכן שהקישור פג תוקף או שהוא לא תקין.
            </p>
          </div>

          {/* English Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Email Verification Failed
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We couldn&apos;t verify your email address.
              <br />
              The link may have expired or is invalid.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              נסה שוב | Try Again
            </Link>
            
            <div className="text-center">
              <p className="text-sm text-gray-500" dir="rtl">
                לא קיבלת מייל אימות?
              </p>
              <p className="text-xs text-gray-400">
                Didn&apos;t receive verification email?
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500" dir="rtl">
              <p className="mb-2">בעיות באימות? נסה:</p>
              <ul className="text-xs space-y-1">
                <li>• בדוק את תיקיית הספאם</li>
                <li>• וודא שהמייל נכון</li>
                <li>• הירשם שוב עם מייל חדש</li>
              </ul>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              <p>Verification issues? Try checking spam folder or re-subscribing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 