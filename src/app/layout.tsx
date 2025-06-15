import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'עדכוני אל על | El Al Updates Notification',
  description: 'קבל עדכונים מיידיים על שינויים באתר אל על | Get instant notifications about El Al website changes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 