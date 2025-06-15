import crypto from 'crypto'

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateUnsubscribeToken({ email }: { email: string }): string {
  return crypto.createHash('sha256').update(`${email}-${Date.now()}`).digest('hex')
} 