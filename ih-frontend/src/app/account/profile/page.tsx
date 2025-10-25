'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Bell,
  Globe,
  Save,
  X,
  Camera
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store'
import { useUpdateUser } from '@/hooks/use-account'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  preferences: z.object({
    currency: z.string().optional(),
    language: z.string().optional(),
    newsletter: z.boolean().optional(),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      whatsapp: z.boolean()
    }).optional()
  }).optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, updateUser: updateStoreUser } = useAuthStore()
  const { mutate: updateUser, isPending } = useUpdateUser()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || 'male',
      address: user?.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      },
      preferences: {
        currency: user?.preferences?.currency || 'INR',
        language: user?.preferences?.language || 'en',
        newsletter: user?.preferences?.newsletter ?? true,
        notifications: user?.preferences?.notifications || {
          email: true,
          sms: true,
          whatsapp: true
        }
      }
    }
  })

  const onSubmit = (data: ProfileFormData) => {
    updateUser(data, {
      onSuccess: (updatedUser) => {
        updateStoreUser(updatedUser)
        setIsEditing(false)
      }
    })
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <Card className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-sapphire-500 to-emerald-500 text-white">
                  {getInitials(user?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user?.createdAt || '').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="mobile"
                  {...register('mobile')}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
              {errors.mobile && (
                <p className="text-sm text-red-600 mt-1">{errors.mobile.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                {...register('gender')}
                disabled={!isEditing}
                className={`w-full h-10 rounded-md border border-gray-300 px-3 text-sm ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address.street">Street Address</Label>
              <Textarea
                id="address.street"
                {...register('address.street')}
                disabled={!isEditing}
                rows={2}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address.city">City</Label>
                <Input
                  id="address.city"
                  {...register('address.city')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <Label htmlFor="address.state">State</Label>
                <Input
                  id="address.state"
                  {...register('address.state')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <Label htmlFor="address.country">Country</Label>
                <Input
                  id="address.country"
                  {...register('address.country')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <Label htmlFor="address.postalCode">Postal Code</Label>
                <Input
                  id="address.postalCode"
                  {...register('address.postalCode')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                {...register('preferences.currency')}
                disabled={!isEditing}
                className={`w-full h-10 rounded-md border border-gray-300 px-3 text-sm ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                {...register('preferences.language')}
                disabled={!isEditing}
                className={`w-full h-10 rounded-md border border-gray-300 px-3 text-sm ${
                  !isEditing ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  {...register('preferences.newsletter')}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="newsletter" className="!mb-0 cursor-pointer">
                  Subscribe to newsletter
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications.email"
                  {...register('preferences.notifications.email')}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="notifications.email" className="!mb-0 cursor-pointer">
                  Enable email notifications
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications.sms"
                  {...register('preferences.notifications.sms')}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="notifications.sms" className="!mb-0 cursor-pointer">
                  Enable SMS notifications
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications.whatsapp"
                  {...register('preferences.notifications.whatsapp')}
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="notifications.whatsapp" className="!mb-0 cursor-pointer">
                  Enable WhatsApp notifications
                </Label>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-end space-x-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </form>
    </div>
  )
}
