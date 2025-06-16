import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תנאי שימוש | Terms of Use - עדכוני אל על',
  description: 'תנאי השימוש בשירות עדכוני אל על | Terms of Use for El Al Updates Notification Service',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <h1 className="text-3xl font-bold text-center">
              תנאי שימוש | Terms of Use
            </h1>
            <p className="text-center text-blue-100 mt-2">
              עדכוני אל על | El Al Updates Notification Service
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Hebrew Section */}
            <div dir="rtl" className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">תנאי שימוש</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-sm text-gray-500">
                  עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
                </p>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. אודות השירות</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="font-bold text-yellow-800 mb-2">הבהרה חשובה:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>אנחנו לא קשורים לחברת אל על בשום צורה</li>
                      <li>זהו שירות עצמאי שנועד לעזור לאנשים שנתקעים בחו&quot;ל</li>
                      <li>אנחנו פועלים באופן עצמאי ללא קשר לחברת התעופה</li>
                    </ul>
                  </div>
                  <p>
                    שירות &quot;עדכוני אל על&quot; הוא שירות עצמאי שמספק התראות על עדכונים באתר אל על (elal.com). 
                    השירות פועל באמצעות מעקב אוטומטי אחר שינויים באתר אל על ושליחת הודעות דוא&quot;ל למנויים.
                    מטרת השירות היא לעזור לנוסעים שנתקעים בחו&quot;ל לקבל מידע עדכני במהירות.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. אחריות מוגבלת - חשוב לקרוא!</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-800 mb-2">הצהרת אחריות:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      <li>אין אחריות על דיוק או שלמות המידע המועבר</li>
                      <li>השירות הוא &quot;כפי שהוא&quot; ללא אחריות או התחייבות</li>
                      <li>חובה לבדוק את המידע הרשמי באתר אל על לפני כל פעולה</li>
                      <li>אין להסתמך אך ורק על השירות לצורך קבלת החלטות נסיעה</li>
                      <li>השירות עלול לחוות הפסקות או שגיאות טכניות</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. שימוש מותר</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>השירות מיועד לשימוש אישי בלבד</li>
                    <li>אסור להשתמש בשירות למטרות מסחריות</li>
                    <li>אסור לשתף או למכור את המידע המתקבל</li>
                    <li>אסור לנסות לפגוע בתפקוד השירות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. שירותי צד שלישי</h3>
                  <p>
                    השירות משתמש בשירותי צד שלישי שונים לצורך:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>שליחת הודעות דוא&quot;ל</li>
                    <li>אחסון נתונים מוצפן</li>
                    <li>ניטור ביצועי השירות</li>
                    <li>אנליטיקה בסיסית</li>
                    <li>עיבוד תוכן מהאתר</li>
                  </ul>
                  <p className="mt-2">
                    כל השירותים עומדים בתקני אבטחה וחוקי הפרטיות הנדרשים.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5. ביטול מנוי</h3>
                  <p>
                    ניתן לבטל מנוי בכל עת על ידי לחיצה על הקישור &quot;ביטול מנוי&quot; בכל הודעת דוא&quot;ל 
                    או על ידי פנייה דרך טופס יצירת הקשר באתר.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">6. שינויים בתנאים</h3>
                  <p>
                    אני שומר לעצמי את הזכות לעדכן תנאים אלה מעת לעת. 
                    שינויים יכנסו לתוקף עם פרסומם באתר.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7. יצירת קשר</h3>
                  <p>
                    לשאלות או בעיות ניתן לפנות דרך טופס יצירת הקשר באתר הראשי.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* English Section */}
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Use</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString('en-US')}
                </p>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. About the Service</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="font-bold text-yellow-800 mb-2">Important Clarification:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>We are not connected to El Al Airlines in any way</li>
                      <li>This is an independent service designed to help people who get stuck abroad</li>
                      <li>We operate independently with no relationship to the airline</li>
                    </ul>
                  </div>
                  <p>
                    The &quot;El Al Updates&quot; service is an independent service that provides notifications about updates 
                    on the El Al website (elal.com). The service operates through automated monitoring of changes 
                    on the El Al website and sending email notifications to subscribers.
                    The purpose of this service is to help travelers who get stuck abroad receive timely information quickly.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Limited Liability - Important!</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-800 mb-2">Liability Statement:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      <li>I have no responsibility for the accuracy or completeness of transmitted information</li>
                      <li>The service is provided &quot;as is&quot; without warranty or commitment</li>
                      <li>You must verify official information on the El Al website before taking any action</li>
                      <li>Do not rely solely on this service for travel decisions</li>
                      <li>The service may experience interruptions or technical errors</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Permitted Use</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>The service is intended for personal use only</li>
                    <li>Commercial use of the service is prohibited</li>
                    <li>Sharing or selling received information is prohibited</li>
                    <li>Attempting to harm the service functionality is prohibited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Third-Party Services</h3>
                  <p>
                    The service uses various third-party services for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Email delivery</li>
                    <li>Encrypted data storage</li>
                    <li>Service performance monitoring</li>
                    <li>Basic analytics</li>
                    <li>Website content processing</li>
                  </ul>
                  <p className="mt-2">
                    All services meet required security and privacy standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Unsubscribe</h3>
                  <p>
                    You can unsubscribe at any time by clicking the &quot;unsubscribe&quot; link in any email 
                    or by contacting us through the contact form on the website.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Changes to Terms</h3>
                  <p>
                    I reserve the right to update these terms from time to time. 
                    Changes will take effect upon posting on the website.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Contact</h3>
                  <p>
                    For questions or issues, please contact us through the contact form on the main website.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  חזרה לעמוד הראשי | Back to Home
                </Link>
                <Link 
                  href="/privacy-policy" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  מדיניות פרטיות | Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 