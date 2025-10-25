'use client'

import { motion } from 'framer-motion'
import { UnifiedFlightSearch } from '@/components/flight/UnifiedFlightSearch'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

const heroVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

export default function FlightSearchPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 relative overflow-hidden"
    >
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
      </div>

      {/* Enhanced Hero Section */}
      <motion.div
        variants={heroVariants}
        className="relative h-[60vh] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center px-4 overflow-hidden"
      >
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300/30 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-indigo-300/30 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-300/30 rounded-full animate-ping delay-1500"></div>
        </div>

        <div className="text-center text-white max-w-4xl relative z-10">
          <motion.h1 
            className="text-5xl sm:text-7xl font-bold mb-6 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Your Journey
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent blur-sm opacity-50 -z-10">
              Your Journey
            </div>
          </motion.h1>
          
          <motion.h2 
            className="text-3xl sm:text-5xl font-bold mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent drop-shadow-xl">
              Starts Here
            </span>
          </motion.h2>

          <motion.p 
            className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Search millions of flights, compare prices, and book your perfect trip with Idea Holiday
          </motion.p>
        </div>
      </motion.div>

      {/* Enhanced Search Box with Glass Morphism */}
      <div className="relative bg-gradient-to-b from-blue-50 to-white pb-16 sm:pb-20">
        <div className="relative -mt-20 z-20">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl"></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-4">
            <UnifiedFlightSearch variant="page" />
          </div>
        </div>
      </div>

      {/* Enhanced Trust Badges / Quick Info */}
      <motion.div
        variants={heroVariants}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Trusted by Millions
            </span>
          </h2>
          <p className="text-xl text-slate-600">Join travelers worldwide who trust Idea Holiday</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <motion.div 
            className="text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="text-5xl font-bold text-blue-600 mb-2">10M+</div>
                <div className="text-slate-600 font-medium">Flights Searched Daily</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="text-5xl font-bold text-indigo-600 mb-2">500+</div>
                <div className="text-slate-600 font-medium">Airlines Worldwide</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="text-center group"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-xl">
                <div className="text-5xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-slate-600 font-medium">Customer Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
