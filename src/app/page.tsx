import { SubscribeForm } from '@/components/subscribe-form/SubscribeForm'
import { AnimatedFeatures } from '@/components/layout/AnimatedFeatures'
import { ContactForm } from '@/components/contact-form'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">

        <SubscribeForm />

        <AnimatedFeatures />

        <ContactForm />
      </div>
      
      <Footer />
    </div>
  )
} 