'use client'

import { motion } from 'framer-motion'
import { Globe, Mail, Clock } from 'lucide-react'

export function AnimatedFeatures() {
  return (
    <motion.div 
      className="max-w-4xl mx-auto mt-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ניטור חכם</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            עוקבים בצורה חכמה אחרי שינויי תוכן ומסננים רעש
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">התראות מיידיות</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            קבל התראות מעוצבות במייל ברגע שהשינויים מתרחשים
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">עדכונים בזמן אמת</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            ניטור רציף כל 10 דקות מבטיח שלא תפספס כלום
          </p>
        </div>
      </div>
    </motion.div>
  )
} 