import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:5001'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      data: { requiresOTP: true }
    })
  }),

  http.post(`${API_BASE_URL}/auth/verify-otp`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'candidate',
          firstName: 'Test',
          lastName: 'User'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    })
  }),

  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'candidate',
          firstName: 'Test',
          lastName: 'User'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    })
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      data: null
    })
  }),
]
