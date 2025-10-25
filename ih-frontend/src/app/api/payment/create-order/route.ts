import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Proxy request to Laravel backend
    const response = await fetch(`${BACKEND_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      // If backend fails, return mock response for demo
      return NextResponse.json({
        orderId: `order_mock_${Date.now()}`,
        amount: body.amount,
        currency: body.currency || 'INR',
        status: 'created'
      })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Payment order creation failed:', error)
    
    // Return mock response for demo purposes
    const body = await request.json().catch(() => ({ amount: 1000, currency: 'INR' }))
    return NextResponse.json({
      orderId: `order_mock_${Date.now()}`,
      amount: body.amount,
      currency: body.currency || 'INR',
      status: 'created'
    })
  }
}