'use client'

import React, { useState } from 'react'
import { X, AlertCircle, Check } from 'lucide-react'
import type { Passenger } from '@/lib/stores/unified-flight-store'

interface PassengerFormProps {
  passengerIndex: number
  passengerType: 'ADT' | 'CHD' | 'INF'
  initialData?: Passenger
  onSave: (passenger: Passenger) => void
  onCancel: () => void
  isExpanded: boolean
}

export function PassengerForm({
  passengerIndex,
  passengerType,
  initialData,
  onSave,
  onCancel,
  isExpanded,
}: PassengerFormProps) {
  const passengerTypeLabel = {
    ADT: 'Adult',
    CHD: 'Child',
    INF: 'Infant',
  }[passengerType]

  const [formData, setFormData] = useState<Passenger>(
    initialData || {
      id: `passenger-${passengerIndex}`,
      type: passengerType,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'M',
      passport: '',
      nationality: '',
      email: '',
      phone: '',
      frequentFlyerNumber: '',
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string): string | undefined => {
    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`
      if (value.trim().length < 2) return 'Must be at least 2 characters'
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Only letters, spaces, hyphens, and apostrophes allowed'
    }

    if (name === 'dateOfBirth') {
      if (!value) return 'Date of birth is required'
      const dob = new Date(value)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()

      if (passengerType === 'ADT' && age < 18) {
        return 'Adult must be at least 18 years old'
      }
      if (passengerType === 'CHD' && (age < 2 || age >= 18)) {
        return 'Child must be between 2 and 18 years old'
      }
      if (passengerType === 'INF' && age >= 2) {
        return 'Infant must be less than 2 years old'
      }
    }

    if (name === 'gender') {
      if (!value) return 'Gender is required'
    }

    if (name === 'email' && formData.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Invalid email address'
    }

    if (name === 'phone' && value) {
      if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
        return 'Phone must be 10 digits'
      }
    }

    return undefined
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[name] = error
        } else {
          delete newErrors[name]
        }
        return newErrors
      })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    setErrors((prev) => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[name] = error
      } else {
        delete newErrors[name]
      }
      return newErrors
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender']
    const newErrors: Record<string, string> = {}

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof Passenger] as string || '')
      if (error) {
        newErrors[field] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  const getMaxDate = (): string => {
    const today = new Date()

    if (passengerType === 'ADT') {
      // Adult: must be at least 18 years old
      today.setFullYear(today.getFullYear() - 18)
    } else if (passengerType === 'CHD') {
      // Child: must be between 2 and 18 years old
      today.setFullYear(today.getFullYear() - 2)
    } else {
      // Infant: must be less than 2 years old
      today.setFullYear(today.getFullYear() - 1)
    }

    return today.toISOString().split('T')[0]
  }

  const getMinDate = (): string => {
    const today = new Date()

    if (passengerType === 'ADT') {
      // No upper limit, but realistic: 120 years
      today.setFullYear(today.getFullYear() - 120)
    } else if (passengerType === 'CHD') {
      // Child: max 18 years old
      today.setFullYear(today.getFullYear() - 18)
    } else {
      // Infant: max 2 years old
      today.setFullYear(today.getFullYear() - 2)
    }

    return today.toISOString().split('T')[0]
  }

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.dateOfBirth &&
    formData.gender &&
    Object.keys(errors).length === 0

  if (!isExpanded) {
    return (
      <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sapphire-100 text-sapphire-700 font-semibold">
              {passengerIndex + 1}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {passengerTypeLabel} {passengerIndex + 1}
              </p>
              {formData.firstName && formData.lastName && (
                <p className="text-sm text-gray-600">
                  {formData.firstName} {formData.lastName}
                </p>
              )}
            </div>
          </div>
          {formData.firstName && formData.lastName && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {passengerTypeLabel} {passengerIndex + 1}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close form"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                errors.firstName
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-sapphire-200'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                errors.lastName
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-sapphire-200'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onBlur={handleBlur}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                errors.dateOfBirth
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-sapphire-200'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                errors.gender
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-sapphire-200'
              }`}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.gender}
              </p>
            )}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Optional Information</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passport Number
              </label>
              <input
                type="text"
                name="passport"
                value={formData.passport || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                placeholder="ABC1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequent Flyer Number
              </label>
              <input
                type="text"
                name="frequentFlyerNumber"
                value={formData.frequentFlyerNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sapphire-200"
                placeholder="FF1234567890"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isFormValid
                ? 'bg-sapphire-600 text-white hover:bg-sapphire-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Passenger
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
