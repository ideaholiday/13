'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Gift, 
  Percent, 
  Coins, 
  Star, 
  Clock, 
  Calendar, 
  Copy, 
  Share2, 
  Download, 
  Mail, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Minus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Award, 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  FileText,
  CreditCard,
  Smartphone,
  Wallet,
  Users,
  MapPin,
  Plane,
  Zap,
  Heart,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Voucher {
  id: string
  code: string
  name: string
  type: 'discount' | 'cashback' | 'points' | 'freebie'
  value: number
  currency?: string
  minAmount?: number
  maxDiscount?: number
  expiryDate: string
  isActive: boolean
  isUsed: boolean
  usageCount: number
  maxUsage?: number
  description: string
  terms: string[]
  category: string
  applicableServices: string[]
  generatedDate: string
  lastUsed?: string
  balance?: number
  transferable: boolean
  shareable: boolean
  refundable: boolean
}

interface VoucherFilters {
  category: string
  status: string
  type: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface VoucherStats {
  totalVouchers: number
  activeVouchers: number
  usedVouchers: number
  expiredVouchers: number
  totalValue: number
  totalSavings: number
}

const DEMO_VOUCHERS: Voucher[] = [
  {
    id: '1',
    code: 'WELCOME50',
    name: 'Welcome Bonus',
    type: 'discount',
    value: 50,
    currency: 'INR',
    minAmount: 5000,
    maxDiscount: 1000,
    expiryDate: '2025-12-31',
    isActive: true,
    isUsed: false,
    usageCount: 0,
    maxUsage: 1,
    description: 'Get ₹50 off on your first booking',
    terms: ['Valid for new users only', 'Minimum booking amount ₹5000', 'Cannot be combined with other offers'],
    category: 'Welcome',
    applicableServices: ['Flights', 'Hotels'],
    generatedDate: '2025-01-15',
    transferable: false,
    shareable: false,
    refundable: false
  },
  {
    id: '2',
    code: 'FLY100',
    name: 'Flight Discount',
    type: 'discount',
    value: 100,
    currency: 'INR',
    minAmount: 10000,
    maxDiscount: 500,
    expiryDate: '2025-11-30',
    isActive: true,
    isUsed: false,
    usageCount: 0,
    maxUsage: 3,
    description: 'Get ₹100 off on flight bookings',
    terms: ['Valid on domestic flights', 'Minimum booking amount ₹10000', 'One time use only'],
    category: 'Flight',
    applicableServices: ['Flights'],
    generatedDate: '2025-01-10',
    transferable: true,
    shareable: true,
    refundable: true
  },
  {
    id: '3',
    code: 'CASHBACK20',
    name: 'Cashback Voucher',
    type: 'cashback',
    value: 20,
    currency: 'INR',
    minAmount: 2000,
    expiryDate: '2025-12-15',
    isActive: true,
    isUsed: false,
    usageCount: 0,
    maxUsage: 5,
    description: 'Get ₹20 cashback in your wallet',
    terms: ['Cashback credited within 24 hours', 'Minimum booking amount ₹2000', 'Valid for all bookings'],
    category: 'Cashback',
    applicableServices: ['Flights', 'Hotels', 'Packages'],
    generatedDate: '2025-01-05',
    balance: 20,
    transferable: false,
    shareable: false,
    refundable: true
  },
  {
    id: '4',
    code: 'POINTS500',
    name: 'Loyalty Points',
    type: 'points',
    value: 500,
    expiryDate: '2025-12-31',
    isActive: true,
    isUsed: false,
    usageCount: 0,
    maxUsage: 1,
    description: 'Earn 500 loyalty points',
    terms: ['Points credited after successful booking', 'Valid for 1 year', 'Can be redeemed for future bookings'],
    category: 'Loyalty',
    applicableServices: ['Flights', 'Hotels'],
    generatedDate: '2025-01-20',
    transferable: false,
    shareable: false,
    refundable: false
  },
  {
    id: '5',
    code: 'FREEBIE',
    name: 'Free Meal Voucher',
    type: 'freebie',
    value: 0,
    currency: 'INR',
    minAmount: 5000,
    expiryDate: '2025-10-31',
    isActive: true,
    isUsed: true,
    usageCount: 1,
    maxUsage: 1,
    description: 'Free meal on flight booking',
    terms: ['Valid on flights over ₹5000', 'One time use only', 'Subject to availability'],
    category: 'Freebie',
    applicableServices: ['Flights'],
    generatedDate: '2025-01-01',
    lastUsed: '2025-01-15',
    transferable: false,
    shareable: false,
    refundable: false
  }
]

const CATEGORIES = ['All', 'Welcome', 'Flight', 'Cashback', 'Loyalty', 'Freebie']
const STATUSES = ['All', 'Active', 'Used', 'Expired']
const TYPES = ['All', 'Discount', 'Cashback', 'Points', 'Freebie']
const SORT_OPTIONS = ['Name', 'Value', 'Expiry', 'Generated', 'Usage']

export function PolishedVoucherSystem() {
  const [vouchers, setVouchers] = useState<Voucher[]>(DEMO_VOUCHERS)
  const [filters, setFilters] = useState<VoucherFilters>({
    category: 'All',
    status: 'All',
    type: 'All',
    sortBy: 'Name',
    sortOrder: 'asc'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [showVoucherDetails, setShowVoucherDetails] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="h-5 w-5" />
      case 'cashback': return <Coins className="h-5 w-5" />
      case 'points': return <Star className="h-5 w-5" />
      case 'freebie': return <Gift className="h-5 w-5" />
      default: return <Gift className="h-5 w-5" />
    }
  }

  const getVoucherColor = (type: string) => {
    switch (type) {
      case 'discount': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cashback': return 'bg-green-100 text-green-700 border-green-200'
      case 'points': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'freebie': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadge = (voucher: Voucher) => {
    if (!voucher.isActive) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700">Expired</Badge>
    }
    if (voucher.isUsed) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Used</Badge>
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
  }

  const getVoucherStats = (): VoucherStats => {
    return {
      totalVouchers: vouchers.length,
      activeVouchers: vouchers.filter(v => v.isActive && !v.isUsed).length,
      usedVouchers: vouchers.filter(v => v.isUsed).length,
      expiredVouchers: vouchers.filter(v => !v.isActive).length,
      totalValue: vouchers.filter(v => v.isActive && !v.isUsed).reduce((sum, v) => sum + v.value, 0),
      totalSavings: vouchers.filter(v => v.isUsed).reduce((sum, v) => sum + v.value, 0)
    }
  }

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesCategory = filters.category === 'All' || voucher.category === filters.category
    const matchesStatus = filters.status === 'All' || 
      (filters.status === 'Active' && voucher.isActive && !voucher.isUsed) ||
      (filters.status === 'Used' && voucher.isUsed) ||
      (filters.status === 'Expired' && !voucher.isActive)
    const matchesType = filters.type === 'All' || voucher.type === filters.type.toLowerCase()
    const matchesSearch = voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesStatus && matchesType && matchesSearch
  }).sort((a, b) => {
    let comparison = 0
    switch (filters.sortBy) {
      case 'Name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'Value':
        comparison = a.value - b.value
        break
      case 'Expiry':
        comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        break
      case 'Generated':
        comparison = new Date(a.generatedDate).getTime() - new Date(b.generatedDate).getTime()
        break
      case 'Usage':
        comparison = a.usageCount - b.usageCount
        break
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison
  })

  const stats = getVoucherStats()

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  const shareVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setShowShareModal(true)
  }

  const transferVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setShowTransferModal(true)
  }

  const refundVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setShowRefundModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Voucher Management
        </h1>
        <p className="text-xl text-gray-600">Manage your vouchers, discounts, and rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalVouchers}</div>
            <div className="text-sm text-blue-700">Total Vouchers</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.activeVouchers}</div>
            <div className="text-sm text-green-700">Active Vouchers</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">{formatPrice(stats.totalValue)}</div>
            <div className="text-sm text-purple-700">Available Value</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">{formatPrice(stats.totalSavings)}</div>
            <div className="text-sm text-orange-700">Total Savings</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-6 w-6 text-gray-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Order</Label>
              <div className="flex gap-2">
                <Button
                  variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({...filters, sortOrder: 'asc'})}
                  className="flex-1"
                >
                  <SortAsc className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({...filters, sortOrder: 'desc'})}
                  className="flex-1"
                >
                  <SortDesc className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVouchers.map((voucher) => (
          <motion.div
            key={voucher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="cursor-pointer"
            onClick={() => {
              setSelectedVoucher(voucher)
              setShowVoucherDetails(true)
            }}
          >
            <Card className={`h-full transition-all duration-200 hover:shadow-lg ${getVoucherColor(voucher.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getVoucherIcon(voucher.type)}
                    <CardTitle className="text-lg">{voucher.name}</CardTitle>
                  </div>
                  {getStatusBadge(voucher)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {voucher.code}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {voucher.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {voucher.type === 'points' ? `${voucher.value} pts` : formatPrice(voucher.value)}
                  </div>
                  <p className="text-sm text-gray-600">{voucher.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium">{formatDate(voucher.expiryDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usage:</span>
                    <span className="font-medium">{voucher.usageCount}/{voucher.maxUsage || '∞'}</span>
                  </div>
                  {voucher.minAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Amount:</span>
                      <span className="font-medium">{formatPrice(voucher.minAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyVoucherCode(voucher.code)
                    }}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  {voucher.shareable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        shareVoucher(voucher)
                      }}
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Voucher Details Modal */}
      <AnimatePresence>
        {showVoucherDetails && selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Voucher Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoucherDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Voucher Header */}
                <div className={`p-6 rounded-lg ${getVoucherColor(selectedVoucher.type)}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {getVoucherIcon(selectedVoucher.type)}
                    <div>
                      <h4 className="text-xl font-bold">{selectedVoucher.name}</h4>
                      <p className="text-sm opacity-75">{selectedVoucher.description}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {selectedVoucher.type === 'points' ? `${selectedVoucher.value} pts` : formatPrice(selectedVoucher.value)}
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {selectedVoucher.code}
                    </Badge>
                  </div>
                </div>

                {/* Voucher Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedVoucher)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Category</Label>
                    <div className="mt-1 font-medium">{selectedVoucher.category}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Generated</Label>
                    <div className="mt-1 font-medium">{formatDate(selectedVoucher.generatedDate)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Expires</Label>
                    <div className="mt-1 font-medium">{formatDate(selectedVoucher.expiryDate)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Usage</Label>
                    <div className="mt-1 font-medium">{selectedVoucher.usageCount}/{selectedVoucher.maxUsage || '∞'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Min Amount</Label>
                    <div className="mt-1 font-medium">
                      {selectedVoucher.minAmount ? formatPrice(selectedVoucher.minAmount) : 'No minimum'}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <Label className="text-gray-600 mb-2 block">Terms & Conditions</Label>
                  <ul className="space-y-1 text-sm">
                    {selectedVoucher.terms.map((term, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => copyVoucherCode(selectedVoucher.code)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  {selectedVoucher.shareable && (
                    <Button
                      variant="outline"
                      onClick={() => shareVoucher(selectedVoucher)}
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                  {selectedVoucher.transferable && (
                    <Button
                      variant="outline"
                      onClick={() => transferVoucher(selectedVoucher)}
                      className="flex-1"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer
                    </Button>
                  )}
                  {selectedVoucher.refundable && (
                    <Button
                      variant="outline"
                      onClick={() => refundVoucher(selectedVoucher)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refund
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredVouchers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vouchers Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setFilters({
                  category: 'All',
                  status: 'All',
                  type: 'All',
                  sortBy: 'Name',
                  sortOrder: 'asc'
                })
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
