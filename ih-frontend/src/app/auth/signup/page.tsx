import { Metadata } from 'next'
import { AuthPage } from '@/components/auth/auth-page'

export const metadata: Metadata = {
  title: 'Sign Up - Idea Holiday',
  description: 'Create your Idea Holiday account to start booking flights, hotels, and packages with exclusive member benefits.',
  keywords: ['sign up', 'register', 'create account', 'travel booking registration'],
}

export default function SignUpPage() {
  return <AuthPage mode="register" />
}