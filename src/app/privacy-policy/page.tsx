import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | Privacy Policy - עדכוני אל על',
  description: 'מדיניות הפרטיות של שירות עדכוני אל על | Privacy Policy for El Al Updates Notification Service',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          
          {/* Header */}
          <div className="bg-green-600 text-white p-6 rounded-t-lg">
            <h1 className="text-3xl font-bold text-center">
              מדיניות פרטיות | Privacy Policy
            </h1>
            <p className="text-center text-green-100 mt-2">
              עדכוני אל על | El Al Updates Notification Service
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Hebrew Section */}
            <div dir="rtl" className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">מדיניות פרטיות</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-sm text-gray-500">
                  עדכון אחרון: 16/06/2025
                </p>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. מידע שאנו אוספים</h3>
                  <p className="mb-2">אנו אוספים את המידע הבא:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>כתובת דוא&quot;ל:</strong> לצורך שליחת התראות</li>
                    <li><strong>זמן הרשמה:</strong> לניהול המנויים</li>
                    <li><strong>סטטוס אימות:</strong> לוודא תקינות הדוא&quot;ל</li>
                    <li><strong>נתוני אנליטיקה:</strong> שימוש באתר וקליקים (אנונימיים)</li>
                    <li><strong>מידע טכני:</strong> לוגים לפתרון בעיות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. איך אנו משתמשים במידע</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>שליחת הודעות דוא&quot;ל על עדכוני אל על</li>
                    <li>אימות כתובות דוא&quot;ל</li>
                    <li>שיפור השירות וחווית המשתמש</li>
                    <li>מעקב אחר ביצועי השירות</li>
                    <li>פתרון בעיות טכניות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. שירותי צד שלישי</h3>
                  <p className="mb-2">השירות משתמש בשירותי הצד השלישי הבאים:</p>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>שליחת הודעות דוא&quot;ל והתראות</li>
                      <li>אחסון נתונים מוצפן ובטוח</li>
                      <li>ניטור ביצועי השירות</li>
                      <li>אנליטיקה בסיסית לשיפור השירות</li>
                      <li>עיבוד תוכן מאתר אל על</li>
                      <li>אירוח האתר והתשתית</li>
                    </ul>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    כל שירותי הצד השלישי שאנו משתמשים בהם עומדים בתקני אבטחה גבוהים וחוקי פרטיות מחמירים.
                    חלק מהשירותים ממוקמים באירופה ועומדים בתקני GDPR.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. שמירת המידע</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>המידע נשמר כל עוד המנוי פעיל</li>
                    <li>נתוני אנליטיקה נשמרים באופן אנונימי</li>
                    <li>כל המידע מוצפן בטרנזיט ובמנוחה</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5. העברת מידע</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>המידע לא נמכר או נמסר לצדדים שלישיים</li>
                    <li>העברות מידע נעשות רק לצורך הפעלת השירות</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">6. זכויותיך</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                      <li><strong>גישה:</strong> לבקש עותק של המידע שלך</li>
                      <li><strong>תיקון:</strong> לתקן מידע לא מדויק</li>
                      <li><strong>מחיקה:</strong> לבקש מחיקת המידע</li>
                      <li><strong>ביטול מנוי:</strong> בכל עת ללא הסבר</li>
                      <li><strong>העברה:</strong> לקבל את המידע בפורמט מובנה</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7. אבטחת מידע</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>שימוש בהצפנה מתקדמת (TLS/SSL)</li>
                    <li>גישה מוגבלת למידע רק לצורך השירות</li>
                    <li>ניטור אבטחה רציף</li>
                    <li>גיבויים מוצפנים</li>
                    <li>עדכוני אבטחה סדירים</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">8. עדכונים במדיניות</h3>
                  <p>
                    מדיניות זו עשויה להתעדכן מעת לעת. עדכונים משמעותיים יובאו לידיעת המשתמשים 
                    באמצעות הודעת דוא&quot;ל או הודעה באתר.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">9. יצירת קשר</h3>
                  <p>
                    לשאלות בנושא פרטיות או לממש זכויותיך, אנא פנה דרך טופס יצירת הקשר באתר.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* English Section */}
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString('en-US')}
                </p>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                  <p className="mb-2">We collect the following information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Email address:</strong> For sending notifications</li>
                    <li><strong>Registration time:</strong> For subscription management</li>
                    <li><strong>Verification status:</strong> To ensure email validity</li>
                    <li><strong>Analytics data:</strong> Website usage and clicks (anonymous)</li>
                    <li><strong>Technical information:</strong> Logs for troubleshooting</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. How We Use Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Send email notifications about El Al updates</li>
                    <li>Verify email addresses</li>
                    <li>Improve service and user experience</li>
                    <li>Monitor service performance</li>
                    <li>Troubleshoot technical issues</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Third-Party Services</h3>
                  <p className="mb-2">The service uses the following third-party services:</p>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Email delivery and notifications</li>
                      <li>Encrypted and secure data storage</li>
                      <li>Service performance monitoring</li>
                      <li>Basic analytics for service improvement</li>
                      <li>Content processing from El Al website</li>
                      <li>Website hosting and infrastructure</li>
                    </ul>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    All third-party services we use meet high security standards and strict privacy laws.
                    Some services are located in Europe and comply with GDPR standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Data Retention</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Information is stored as long as subscription is active</li>
                    <li>After unsubscription, data is deleted within 30 days</li>
                    <li>Analytics data is stored anonymously</li>
                    <li>All data is encrypted in transit and at rest</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Data Transfer</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Information is not sold or shared with third parties</li>
                    <li>Data transfers occur only for service operation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">6. Your Rights</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                      <li><strong>Access:</strong> Request a copy of your information</li>
                      <li><strong>Correction:</strong> Fix inaccurate information</li>
                      <li><strong>Deletion:</strong> Request information deletion</li>
                      <li><strong>Unsubscribe:</strong> At any time without explanation</li>
                      <li><strong>Portability:</strong> Receive data in structured format</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">7. Data Security</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Advanced encryption (TLS/SSL)</li>
                    <li>Limited access to information only for service purposes</li>
                    <li>Continuous security monitoring</li>
                    <li>Encrypted backups</li>
                    <li>Regular security updates</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">8. Policy Updates</h3>
                  <p>
                    This policy may be updated from time to time. Significant updates will be communicated 
                    to users via email notification or website notice.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">9. Contact</h3>
                  <p>
                    For privacy questions or to exercise your rights, please contact us through 
                    the contact form on the website.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 pt-6 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  חזרה לעמוד הראשי | Back to Home
                </Link>
                <Link 
                  href="/terms-of-use" 
                  className="text-green-600 hover:text-green-800 underline"
                >
                  תנאי שימוש | Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 