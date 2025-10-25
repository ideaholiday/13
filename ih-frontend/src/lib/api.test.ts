// Minimal tests for ApiError/fetchJSON behavior. Adapt to your test runner.
// @jest-environment node
import '@testing-library/jest-dom'
import { ApiError, fetchJSON } from './api'

describe('ApiError', () => {
  it('constructs with status and message', () => {
    const e = new ApiError('fail', 400, 'BAD', { x: 1 })
    expect(e.message).toBe('fail')
    expect(e.status).toBe(400)
    expect(e.code).toBe('BAD')
    expect(e.details).toEqual({ x: 1 })
  })
})

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

describe('Demo Payment API', () => {
  beforeAll(() => {
    global.fetch = jest.fn((url, options) => {
      if (typeof url === 'string' && url.includes('/payments/create-order')) {
        const mockBody = JSON.stringify({
          orderId: 'order_mock_123',
          amount: 1000,
          currency: 'INR',
          status: 'created',
        })
        return Promise.resolve({
          ok: true,
          text: async () => mockBody,
          json: async () => JSON.parse(mockBody),
        })
      }
      if (typeof url === 'string' && url.includes('/payments/verify')) {
        const mockBody = JSON.stringify({
          success: true,
          status: 'verified',
          message: 'Payment verified successfully',
        })
        return Promise.resolve({
          ok: true,
          text: async () => mockBody,
          json: async () => JSON.parse(mockBody),
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  it('creates a payment order (mock)', async () => {
    const body = { amount: 1000, currency: 'INR' }
    const res = await fetchJSON<{ orderId: string; amount: number; currency: string; status: string }>(
      `${BACKEND_URL}/api/v1/payments/create-order`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    expect(res.orderId).toMatch(/^order_mock_/)
    expect(res.amount).toBe(1000)
    expect(res.currency).toBe('INR')
    expect(res.status).toBe('created')
  })

  it('verifies a payment (mock)', async () => {
    const body = { paymentId: 'pay_mock_123', orderId: 'order_mock_123' }
    const res = await fetchJSON<{ success: boolean; status: string; message: string }>(
      `${BACKEND_URL}/api/v1/payments/verify`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }
    )
    expect(res.success).toBe(true)
    expect(res.status).toBe('verified')
    expect(res.message).toMatch(/Payment verified successfully/)
  })
})
