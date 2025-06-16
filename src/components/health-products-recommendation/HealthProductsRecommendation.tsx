import { Heart } from 'lucide-react'

export function HealthProductsRecommendation() {
  return (
    <div className="max-w-2xl mx-auto mt-8 mb-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            מעקב מחירים על iHerb
          </h3>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            קונים תוספי תזונה ומוצרי בריאות מ-iHerb? 
            עוקב אחר מחירי המוצרים 24/7 ושולח התראות כשהמחירים יורדים למחיר המטרה שלכם. 
            השירות חינמי לחלוטין ויכול לחסוך לכם על הרכישות!
          </p>
          
          <a
            href="https://pricedrop.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            עקבו אחר מחירים ב-PriceDrop.pro
            <Heart className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
} 