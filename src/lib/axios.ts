import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// =============================================================================
// Axios Instance Configuration
// =============================================================================

export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: unknown[]
  }
  timestamp: string
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: Date
    }
  }
}

class ApiClient {
  private instance: AxiosInstance

  constructor(config: ApiClientConfig = {}) {
    this.instance = axios.create({
      baseURL:
        config.baseURL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3000/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      config => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add timestamp for debugging
        config.metadata = { startTime: new Date() }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate response time
        const endTime = new Date()
        const startTime = response.config.metadata?.startTime
        if (startTime) {
          const duration = endTime.getTime() - startTime.getTime()
          console.log(`API call to ${response.config.url} took ${duration}ms`)
        }

        return response
      },
      (error: AxiosError) => {
        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    // For starter kit - implement token retrieval as needed
    // Example: check localStorage, sessionStorage, or cookies
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || null
    }
    return null
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data as ApiResponse

      switch (status) {
        case 401:
          // Unauthorized - clear tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            // Redirect to login if needed
            console.log('Unauthorized - please login')
          }
          break
        case 403:
          console.error('Access forbidden:', data.error?.message)
          break
        case 404:
          console.error('Resource not found:', data.error?.message)
          break
        case 429:
          console.error('Rate limit exceeded:', data.error?.message)
          break
        case 500:
          console.error('Server error:', data.error?.message)
          break
        default:
          console.error('API error:', data.error?.message)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received')
    } else {
      // Request configuration error
      console.error('Request error:', error.message)
    }
  }

  // HTTP Methods
  async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.instance.get<T>(url, { params })
    return response.data
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.post<T>(url, data)
    return response.data
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.put<T>(url, data)
    return response.data
  }

  async patch<T = unknown>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.patch<T>(url, data)
    return response.data
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url)
    return response.data
  }

  // File upload
  async upload<T = unknown>(url: string, formData: FormData): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Custom request method
  async request<T = unknown>(config: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    data?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
  }): Promise<T> {
    const response = await this.instance.request<T>({
      ...config,
      method: config.method || 'GET',
    })
    return response.data
  }

  // Get the raw axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

// =============================================================================
// Default Instance and Exports
// =============================================================================

// Create default instance
export const apiClient = new ApiClient()

// Create specific instances if needed
export const createApiClient = (config: ApiClientConfig) =>
  new ApiClient(config)

// Export types
export type { AxiosError, AxiosResponse }

// Export instance as default
export default apiClient

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Set authentication token for future requests
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

/**
 * Clear authentication token
 */
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

/**
 * Get current authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}