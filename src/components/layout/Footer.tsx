import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link 
              href="/terms-of-use" 
              className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
            >
              תנאי שימוש | Terms of Use
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
            >
              מדיניות פרטיות | Privacy Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500 space-y-1">
            <p dir="rtl">
              שירות עצמאי לעדכוני אל על • לא קשור לחברת אל על • נועד לעזור לנתקעים בחו&quot;ל
            </p>
            <p>
              Independent El Al updates service • Not affiliated with El Al Airlines • Designed to help people stuck abroad
            </p>
            <p className="text-xs">
              בדוק תמיד את האתר הרשמי לפני כל פעולה • Always verify on official website before taking action
            </p>
            <p className="mt-2">
              © 2025 El Al Updates Notification Service
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 