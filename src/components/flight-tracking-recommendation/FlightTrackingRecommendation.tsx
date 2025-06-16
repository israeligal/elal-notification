import { ExternalLink } from 'lucide-react'

export function FlightTrackingRecommendation() {
  return (
    <div className="max-w-2xl mx-auto mt-16 mb-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <ExternalLink className="w-6 h-6 text-purple-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            מעקב אחר מחירי טיסות ספציפיות
          </h3>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            רוצים לעקוב אחר מחיר של טיסה ספציפית? אנחנו ממליצים על{' '}
            <strong>FlightFare Pro</strong> - שירות חינמי ומצוין שיעדכן אותכם ברגע 
            שמחיר הטיסה שלכם יורד למחיר המטרה שהגדרתם.
          </p>
          
          <a
            href="http://flightfare.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            בקרו ב-FlightFare Pro
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
} 