'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useLogin, useLoginWithMobile, useSendOTP } from '@/hooks/use-account'
import { signInWithGoogle } from '@/lib/google-auth'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const mobileSchema = z.object({
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits')
})

type EmailFormData = z.infer<typeof emailSchema>
type MobileFormData = z.infer<typeof mobileSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const loginMutation = useLogin()
  const loginMobileMutation = useLoginWithMobile()
  const sendOTPMutation = useSendOTP()

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: 'john.doe@example.com',
      password: 'password123'
    }
  })

  const mobileForm = useForm<MobileFormData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: {
      mobile: '+919876543210',
      otp: ''
    }
  })

  const onEmailSubmit = async (data: EmailFormData) => {
    await loginMutation.mutateAsync(data)
    router.push('/account/dashboard')
  }

  const onMobileSubmit = async (data: MobileFormData) => {
    await loginMobileMutation.mutateAsync(data)
    router.push('/account/dashboard')
  }

  const handleSendOTP = async () => {
    const mobile = mobileForm.getValues('mobile')
    if (mobile) {
      await sendOTPMutation.mutateAsync(mobile)
      setOtpSent(true)
    }
  }

  const socialProviders = [
    { name: 'Google', icon: '🔍', color: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300' },
    { name: 'Apple', icon: '', color: 'bg-black hover:bg-gray-900 text-white' },
    { name: 'Facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700 text-white' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sapphire-900 to-emerald-900 text-white font-bold text-xl shadow-lg">
              IH
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold font-display gradient-text">
                Idea Holiday
              </div>
              <div className="text-sm text-gray-600">Welcome back!</div>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Sign In</h1>
          <p className="text-center text-gray-600 mb-6">
            Access your bookings and manage your trips
          </p>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-white shadow-sm text-sapphire-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setLoginMethod('mobile')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                loginMethod === 'mobile'
                  ? 'bg-white shadow-sm text-sapphire-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="h-4 w-4 inline mr-2" />
              Mobile
            </button>
          </div>

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className="pl-10"
                    {...emailForm.register('email')}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...emailForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {emailForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {emailForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sapphire-900 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </motion.form>
          )}

          {/* Mobile Login Form */}
          {loginMethod === 'mobile' && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={mobileForm.handleSubmit(onMobileSubmit)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    {...mobileForm.register('mobile')}
                  />
                </div>
                {mobileForm.formState.errors.mobile && (
                  <p className="text-sm text-red-600 mt-1">
                    {mobileForm.formState.errors.mobile.message}
                  </p>
                )}
              </div>

              {!otpSent ? (
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full"
                  disabled={sendOTPMutation.isPending}
                >
                  {sendOTPMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="mt-1 text-center text-lg tracking-widest"
                      {...mobileForm.register('otp')}
                    />
                    {mobileForm.formState.errors.otp && (
                      <p className="text-sm text-red-600 mt-1">
                        {mobileForm.formState.errors.otp.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      OTP sent to your mobile number
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMobileMutation.isPending}
                  >
                    {loginMobileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Sign In
                  </Button>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full text-sm text-sapphire-900 hover:underline"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </motion.form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                className={`py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 ${provider.color}`}
                onClick={provider.name === 'Google' ? signInWithGoogle : undefined}
              >
                <span className="text-xl">{provider.icon}</span>
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-sapphire-900 font-semibold hover:underline">
              Sign up now
            </Link>
          </p>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg text-sm text-gray-600 text-center"
        >
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Email: john.doe@example.com | Password: password123</p>
          <p>Mobile: +919876543210 | OTP: 123456</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
