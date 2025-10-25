'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Star,
  User,
  Calendar,
  CreditCard,
  X,
  Save
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
  useTravellers, 
  useAddTraveller, 
  useUpdateTraveller, 
  useDeleteTraveller 
} from '@/hooks/use-account'
import { Traveller } from '@/types/account'

const travellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  type: z.enum(['adult', 'child', 'infant']),
  isPrimary: z.boolean().optional(),
  passport: z.object({
    number: z.string().optional(),
    expiryDate: z.string().optional(),
    nationality: z.string().optional()
  }).optional()
})

type TravellerFormData = z.infer<typeof travellerSchema>

export default function TravellersPage() {
  const { data: travellers, isLoading } = useTravellers()
  const { mutate: addTraveller } = useAddTraveller()
  const { mutate: updateTraveller } = useUpdateTraveller()
  const { mutate: deleteTraveller } = useDeleteTraveller()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTraveller, setEditingTraveller] = useState<Traveller | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TravellerFormData>({
    resolver: zodResolver(travellerSchema),
    defaultValues: editingTraveller || {
      name: '',
      dateOfBirth: '',
      gender: 'male',
      type: 'adult',
      isPrimary: false,
      passport: {
        number: '',
        expiryDate: '',
        nationality: ''
      }
    }
  })

  const openAddDialog = () => {
    setEditingTraveller(null)
    reset({
      name: '',
      dateOfBirth: '',
      gender: 'male',
      type: 'adult',
      isPrimary: false,
      passport: {
        number: '',
        expiryDate: '',
        nationality: ''
      }
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (traveller: Traveller) => {
    setEditingTraveller(traveller)
    reset({
      name: traveller.name,
      dateOfBirth: traveller.dateOfBirth,
      gender: traveller.gender,
      type: traveller.type,
      isPrimary: traveller.isPrimary,
      passport: traveller.passport || {
        number: '',
        expiryDate: '',
        nationality: ''
      }
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: TravellerFormData) => {
    if (editingTraveller) {
      updateTraveller(
        { id: editingTraveller.id, updates: data as Partial<Traveller> },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            reset()
          }
        }
      )
    } else {
      addTraveller({ ...data, isPrimary: data.isPrimary || false }, {
        onSuccess: () => {
          setIsDialogOpen(false)
          reset()
        }
      })
    }
  }

  const handleDelete = (id: string) => {
    deleteTraveller(id, {
      onSuccess: () => setDeleteConfirm(null)
    })
  }

  const getAgeFromDOB = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Travellers</h1>
          <p className="text-gray-600 mt-1">
            Manage traveller information for quick bookings
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Traveller
        </Button>
      </div>

      {/* Travellers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : travellers && travellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {travellers.map((traveller, index) => (
              <motion.div
                key={traveller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-6 relative ${
                  traveller.isPrimary ? 'border-2 border-sapphire-900' : ''
                }`}>
                  {traveller.isPrimary && (
                    <div className="absolute top-4 right-4">
                      <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-sapphire-500 to-emerald-500">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {traveller.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs capitalize"
                          >
                            {traveller.type}
                          </Badge>
                          {traveller.isPrimary && (
                            <Badge className="text-xs bg-gold-100 text-gold-800">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(traveller.dateOfBirth).toLocaleDateString()} 
                        <span className="ml-2 text-gray-500">
                          ({getAgeFromDOB(traveller.dateOfBirth)} years)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center capitalize">
                      <User className="h-4 w-4 mr-2" />
                      {traveller.gender}
                    </div>
                    {traveller.passport?.number && (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Passport: {traveller.passport.number}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(traveller)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(traveller.id)}
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
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Travellers Added
            </h3>
            <p className="text-gray-600 mb-6">
              Add traveller information for faster bookings. Save time by storing details.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Traveller
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTraveller ? 'Edit Traveller' : 'Add New Traveller'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="As per passport/ID"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="type">Traveller Type *</Label>
                  <select
                    id="type"
                    {...register('type')}
                    className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
                  >
                    <option value="adult">Adult (12+ years)</option>
                    <option value="child">Child (2-11 years)</option>
                    <option value="infant">Infant (0-2 years)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    {...register('isPrimary')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPrimary" className="!mb-0 cursor-pointer">
                    Set as primary traveller
                  </Label>
                </div>
              </div>
            </div>

            {/* Passport Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Passport Information (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passport.number">Passport Number</Label>
                  <Input
                    id="passport.number"
                    {...register('passport.number')}
                    placeholder="e.g., A12345678"
                  />
                </div>

                <div>
                  <Label htmlFor="passport.nationality">Nationality</Label>
                  <Input
                    id="passport.nationality"
                    {...register('passport.nationality')}
                    placeholder="e.g., Indian"
                  />
                </div>

                <div>
                  <Label htmlFor="passport.expiryDate">Expiry Date</Label>
                  <Input
                    id="passport.expiryDate"
                    type="date"
                    {...register('passport.expiryDate')}
                  />
                </div>
              </div>
            </div>

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
                {editingTraveller ? 'Update' : 'Add'} Traveller
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Traveller</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this traveller? This action cannot be undone.
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
