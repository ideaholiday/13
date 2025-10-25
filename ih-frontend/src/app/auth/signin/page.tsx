import { Metadata } from 'next'
import { AuthPage } from '@/components/auth/auth-page'

export const metadata: Metadata = {
  title: 'Sign In - Idea Holiday',
  description: 'Sign in to your Idea Holiday account to manage bookings, view travel history, and access exclusive deals.',
  keywords: ['sign in', 'login', 'user account', 'travel booking login'],
}

export default function SignInPage() {
  return <AuthPage mode="login" />
}