import Link from 'next/link'

export default function VerificationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Hebrew Content */}
          <div className="mb-8" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              !הרשמה הושלמה בהצלחה
            </h1>
            <p className="text-gray-600 leading-relaxed">
              תודה שאימתת את כתובת המייל שלך. 
              <br />
              עכשיו תקבל עדכונים על חדשות אל על ישירות למייל.
            </p>
          </div>

          {/* English Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Registration Complete!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Thank you for verifying your email address. 
              <br />
              You will now receive El Al updates directly to your inbox.
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              חזור לעמוד הבית | Back to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500" dir="rtl">
              רוצה לבטל את המנוי? תוכל לעשות זאת בכל עת דרך הקישור שיופיע בתחתית כל מייל
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Want to unsubscribe? You can do so anytime via the link at the bottom of each email
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 