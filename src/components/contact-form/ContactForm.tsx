'use client'

import { useEffect, useRef, useState, useActionState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { submitContactForm } from '@/lib/actions/contact.actions'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// Import the schema and inferred form data type from the new schema file
import { ContactFormSchema, ContactFormState, type ContactFormData } from '@/lib/schemas/contact.schema'

const CONTACT_TEXT = `שלום לצוות עדכוני אל על,

אני רוצה לשאול על:

`

const FEATURE_TEXT = `שלום לצוות עדכוני אל על,

יש לי רעיון לעוד שירות.  

`

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [formType, setFormType] = useState<'contact' | 'feature'>('contact')

  // useActionState for server interaction
  const initialState: ContactFormState = { success: false, message: '' }
  const [state, formAction] = useActionState(submitContactForm, initialState)

  // useTransition for the server action pending state
  const [isPending, startTransition] = useTransition()

  // react-hook-form setup
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    formState: { errors, isSubmitting } // isSubmitting reflects RHF state, isPending reflects action state
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: formType === 'contact' ? CONTACT_TEXT : FEATURE_TEXT,
      formType: formType,
    },
  })



  // Effect to update message text and formType in react-hook-form state when tab changes
  useEffect(() => {
    const newText = formType === 'contact' ? CONTACT_TEXT : FEATURE_TEXT
    setValue('message', newText) // Update RHF state
    setValue('formType', formType) // Update hidden formType
  }, [formType, setValue])

  // Effect to handle form submission result (success/error toast and reset) from useActionState
  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      reset({ // Reset react-hook-form to empty state
        name: '',
        email: '',
        message: formType === 'contact' ? CONTACT_TEXT : FEATURE_TEXT,
        formType: formType,
      }) 
      // No need to manually clear state from useActionState, it's designed to be read-only after action
    } else if (state.message && !state.success && (state.errors?._form || (!state.errors?.email && !state.errors?.message && !state.errors?.name))) { // Show error toast only if there's a general message OR a _form error
      // Avoid showing toast for field-specific errors handled by RHF below
      toast.error(state.message)
    }
  // Depend only on the server state object and formType
  }, [state, reset, formType])

  const handleTabChange = (value: string) => {
    setFormType(value as 'contact' | 'feature')
  }

  // Wrapper function to handle client validation before triggering server action
  const onSubmit = (data: ContactFormData) => {
    const formData = new FormData()
    formData.append('name', data.name || '')
    formData.append('email', data.email || '')
    formData.append('message', data.message)
    formData.append('formType', data.formType)
    
    // Wrap the server action call in startTransition
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0">
      <h2 className="text-3xl font-light text-center mb-8 text-gray-900">צור קשר</h2>
      
      <Tabs defaultValue="contact" value={formType} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
          <TabsTrigger value="contact" className="cursor-pointer">צור קשר</TabsTrigger>
          <TabsTrigger value="feature" className="cursor-pointer">חסרה לי פונקציה באתר</TabsTrigger>
        </TabsList>
        
        {/* Use RHF's handleSubmit to trigger client validation first */}
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate> 
          {/* Hidden input registered with RHF */}
          <input type="hidden" {...register('formType')} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                שם <span className="text-gray-400">(אופציונלי)</span>
              </label>
              <Input 
                id="name" 
                placeholder="השם שלך" 
                {...register('name')} // Register with RHF
                aria-invalid={errors.name ? "true" : "false"}
                className="bg-gray-50 border-0 focus:bg-white transition-colors rounded-xl h-12"
              />
              {/* Display RHF client-side error */}
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                אימייל <span className="text-gray-400">(אופציונלי)</span>
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                {...register('email')} // Register with RHF
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby="email-error"
                className="bg-gray-50 border-0 focus:bg-white transition-colors rounded-xl h-12"
              />
              {/* Display RHF client-side error */}
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
              {/* Display server-side error if RHF validation passed but server failed */}
              {state.errors?.email && !errors.email && (
                 <p id="email-server-error" className="text-sm text-red-600 mt-1">
                  {state.errors.email[0]}
                 </p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-700">
              הודעה <span className="text-red-500">*</span>
            </label>
            <Textarea 
              id="message" 
              rows={6} 
              {...register('message')} // Register with RHF
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby="message-error"
              className="resize-none bg-gray-50 border-0 focus:bg-white transition-colors rounded-xl"
            />
            {/* Display RHF client-side error */}
            {errors.message && (
              <p id="message-error" className="text-sm text-red-600 mt-1">
                {errors.message.message}
              </p>
            )}
             {/* Display server-side error if RHF validation passed but server failed */}
            {state.errors?.message && !errors.message && (
              <p id="message-server-error" className="text-sm text-red-600 mt-1">
                {state.errors.message[0]}
              </p>
            )}
          </div>
          
          {/* Display general form errors from the server action state */}
          {state.errors?._form && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
              {state.errors._form.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}
          
          {/* Display non-field specific error messages from the server action state */}
          {state.message && !state.success && !state.errors && (
             <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
              <p>{state.message}</p>
             </div>
          )}

          <Button 
            type="submit" 
            className="w-full cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-12 rounded-xl font-medium shadow-lg" 
            disabled={isPending || isSubmitting} // Disable if RHF is submitting OR the action is pending
          > 
            {isPending ? 'שולח...' : 'שלח הודעה'} 
          </Button>
        </form>

        {/* Success message display */}
        {state.success && !isPending && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center">
            <p>{state.message}</p>
          </div>
        )}
      </Tabs>
    </div>
  )
} 