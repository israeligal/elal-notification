import { MapPin } from 'lucide-react'

export function LocalAttractionsRecommendation() {
  return (
    <div className="max-w-2xl mx-auto mt-8 mb-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            מחירים מקומיים לאטרקציות במזרח
          </h3>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            מחפשים אטרקציות וטיולים במחירים הטובים ביותר בווייטנאם, פיליפינים, 
            קוסטה ריקה וקמבודיה? <strong>JourneyJunky</strong> מתקשרים ישירות עם 
            ספקים מקומיים כדי להביא לכם את המחירים הטובים ביותר על אטרקציות וטיולים.
          </p>
          
          <a
            href="https://www.journeyjunky.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            גלו מחירים מקומיים ב-JourneyJunky
            <MapPin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
} 