import React from 'react'

export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sapphire-900 via-sapphire-800 to-emerald-900 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-sapphire-900 mb-4 text-center">
          ✅ Tailwind CSS Working!
        </h1>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-700">Custom colors (sapphire, emerald)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-ruby-500 rounded-full"></div>
            <span className="text-slate-700">Brand colors (ruby, gold)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gold-500 rounded-full"></div>
            <span className="text-slate-700">Gradient backgrounds</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
            <span className="text-slate-700">Backdrop blur effects</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600 text-center">
            If you can see this styled page, Tailwind CSS is working correctly!
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <button className="btn-primary">
            Test Button
          </button>
        </div>
      </div>
    </div>
  )
}
