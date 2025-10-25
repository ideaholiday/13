'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

export default function Scene() {
  const meshRef = useRef<Mesh>(null!)

  // Rotate the mesh every frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Main 3D Object - A rotating plane icon */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.1, 0.3]} />
        <meshStandardMaterial 
          color="#1e3a8a" 
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Additional decorative elements */}
      <mesh position={[-1.5, 0.5, -1]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      <mesh position={[1.5, -0.5, -1]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      
      <mesh position={[0, 1, -2]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </>
  )
}
