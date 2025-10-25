'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  CreditCard, 
  Plus, 
  Trash2,
  Star,
  X,
  Save,
  Building,
  Smartphone
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  usePaymentMethods, 
  useAddPaymentMethod, 
  useUpdatePaymentMethod, 
  useDeletePaymentMethod 
} from '@/hooks/use-account'
import { PaymentMethod } from '@/types/account'

const cardSchema = z.object({
  type: z.literal('card'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry date must be MM/YY'),
  cardType: z.string().optional(),
  isDefault: z.boolean().optional(),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional()
})

const upiSchema = z.object({
  type: z.literal('upi'),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format'),
  isDefault: z.boolean().optional()
})

type CardFormData = z.infer<typeof cardSchema>
type UpiFormData = z.infer<typeof upiSchema>
type PaymentFormData = CardFormData | UpiFormData

export default function PaymentsPage() {
  const { data: paymentMethods, isLoading } = usePaymentMethods()
  const { mutate: addPaymentMethod } = useAddPaymentMethod()
  const { mutate: updatePaymentMethod } = useUpdatePaymentMethod()
  const { mutate: deletePaymentMethod } = useDeletePaymentMethod()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentType === 'card' ? cardSchema : upiSchema)
  })

  const openAddDialog = (type: 'card' | 'upi') => {
    setPaymentType(type)
    reset()
    setIsDialogOpen(true)
  }

  const onSubmit = (data: PaymentFormData) => {
    addPaymentMethod(data as Omit<PaymentMethod, 'id' | 'userId'>, {
      onSuccess: () => {
        setIsDialogOpen(false)
        reset()
      }
    })
  }

  const toggleDefault = (id: string) => {
    updatePaymentMethod({
      id,
      updates: { isDefault: true }
    })
  }

  const handleDelete = (id: string) => {
    deletePaymentMethod(id, {
      onSuccess: () => setDeleteConfirm(null)
    })
  }

  const maskCardNumber = (number: string) => {
    return `**** **** **** ${number.slice(-4)}`
  }

  const getCardIcon = (cardType?: string) => {
    // In a real app, you'd have different icons for Visa, Mastercard, etc.
    return <CreditCard className="h-6 w-6" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-1">
            Manage your saved payment methods for quick checkout
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openAddDialog('card')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
          <Button variant="outline" onClick={() => openAddDialog('upi')}>
            <Plus className="mr-2 h-4 w-4" />
            Add UPI
          </Button>
        </div>
      </div>

      {/* Payment Methods Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : paymentMethods && paymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-6 relative ${
                  method.isDefault ? 'border-2 border-sapphire-900' : ''
                }`}>
                  {method.isDefault && (
                    <div className="absolute top-4 right-4">
                      <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
                    </div>
                  )}

                  {method.type === 'card' ? (
                    <>
                      {/* Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-sapphire-500 to-emerald-500 text-white">
                            {getCardIcon(method.cardType)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {method.cardType || 'Credit/Debit'} Card
                            </h3>
                            <p className="text-sm text-gray-600">
                              {method.cardNumber && maskCardNumber(method.cardNumber)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Cardholder:</span>
                          <span className="font-medium">{method.cardholderName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Expires:</span>
                          <span className="font-medium">{method.expiryDate}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* UPI */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-sapphire-500 text-white">
                            <Smartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">UPI</h3>
                            <p className="text-sm text-gray-600">{method.upiId}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {method.isDefault && (
                    <div className="mt-4 pt-4 border-t">
                      <Badge className="bg-gold-100 text-gold-800">
                        Default Payment Method
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    {!method.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleDefault(method.id)}
                        className="flex-1"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(method.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2">
          <div className="max-w-md mx-auto">
            <div className="mb-4 inline-flex p-4 rounded-full bg-gray-100">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Payment Methods
            </h3>
            <p className="text-gray-600 mb-6">
              Add a payment method to make checkout faster and easier.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => openAddDialog('card')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
              <Button variant="outline" onClick={() => openAddDialog('upi')}>
                <Plus className="mr-2 h-4 w-4" />
                Add UPI
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {paymentType === 'card' ? 'Card' : 'UPI'} Payment Method
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register('type')} value={paymentType} />

            {paymentType === 'card' ? (
              <>
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    {...register('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                  {(errors as any).cardNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {(errors as any).cardNumber?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    {...register('cardholderName')}
                    placeholder="John Doe"
                  />
                  {(errors as any).cardholderName && (
                    <p className="text-sm text-red-600 mt-1">
                      {(errors as any).cardholderName?.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      {...register('expiryDate')}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {(errors as any).expiryDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {(errors as any).expiryDate?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cardType">Card Type</Label>
                    <select
                      id="cardType"
                      {...register('cardType')}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">American Express</option>
                      <option value="Rupay">RuPay</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register('isDefault')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="!mb-0 cursor-pointer">
                    Set as default payment method
                  </Label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input
                    id="upiId"
                    {...register('upiId')}
                    placeholder="yourname@upi"
                  />
                  {(errors as any).upiId && (
                    <p className="text-sm text-red-600 mt-1">
                      {(errors as any).upiId?.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register('isDefault')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="!mb-0 cursor-pointer">
                    Set as default payment method
                  </Label>
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this payment method? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
