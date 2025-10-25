'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import Three.js components to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(m => m.Canvas), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-sapphire-50 to-emerald-50 animate-pulse" />
})

const Scene = dynamic(() => import('./Scene'), { 
  ssr: false,
  loading: () => null
})

export default function Hero3D() {
  // Only render if 3D feature is enabled
  if (process.env.NEXT_PUBLIC_FEATURE_3D !== 'true') {
    return null
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-sapphire-50 to-emerald-50 animate-pulse" />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
