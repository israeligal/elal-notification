import { SubscribeForm } from '@/components/subscribe-form/SubscribeForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              עדכוני אל על
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-700 mb-6">
              El Al Updates Notification
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              קבל עדכונים מיידיים בדואר אלקטרוני על שינויים חשובים באתר אל על
              <br />
              <span className="text-base">
                Get instant email notifications about important changes on the El Al website
              </span>
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-blue-600 text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">עדכונים מיידיים</h3>
              <p className="text-sm text-gray-600">Instant Updates</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-blue-600 text-3xl mb-3">✈️</div>
              <h3 className="font-semibold text-gray-900 mb-2">מידע על טיסות</h3>
              <p className="text-sm text-gray-600">Flight Information</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-blue-600 text-3xl mb-3">🔔</div>
              <h3 className="font-semibold text-gray-900 mb-2">התראות חשובות</h3>
              <p className="text-sm text-gray-600">Important Alerts</p>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              הירשם לעדכונים | Subscribe for Updates
            </h3>
            <SubscribeForm />
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-sm text-gray-500 space-y-2">
            <p>✓ ביטול הרשמה בכל עת | Unsubscribe anytime</p>
            <p>✓ ללא דואר זבל | No spam</p>
            <p>✓ בדיקות כל 10 דקות | Checks every 10 minutes</p>
          </div>
        </div>
      </div>
    </main>
  )
} 