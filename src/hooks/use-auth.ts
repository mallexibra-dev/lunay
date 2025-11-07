import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient, type ApiResponse } from '@/lib/axios'
import { queryClient } from '@/lib/query-client'

interface User {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  createdAt: string
  updatedAt: string
}

interface SignInData {
  email: string
  password: string
}

interface SignUpData {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  user: User
  token: string
}

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me')

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to get current user')
        }

        return response.data!
      } catch {
        // Return null if user is not authenticated
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Sign in mutation
export function useSignIn() {
  
  return useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/signin',
        data
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Sign in failed')
      }

      return response.data!
    },
    onSuccess: (data) => {
      // Store token in cookies (handled by axios interceptor)
      // Update query cache with current user
      queryClient.setQueryData(['currentUser'], data.user)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Sign in failed'
      console.error('Sign in failed:', errorMessage)
    },
  })
}

// Sign up mutation
export function useSignUp() {
  
  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/signup',
        data
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Sign up failed')
      }

      return response.data!
    },
    onSuccess: (data) => {
      // Store token in cookies (handled by axios interceptor)
      // Update query cache with current user
      queryClient.setQueryData(['currentUser'], data.user)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Sign up failed'
      console.error('Sign up failed:', errorMessage)
    },
  })
}

// Sign out mutation
export function useSignOut() {
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<void>>('/auth/signout')

      if (!response.success) {
        throw new Error(response.error?.message || 'Sign out failed')
      }

      return response.data
    },
    onSuccess: () => {
      // Clear current user from cache
      queryClient.setQueryData(['currentUser'], null)
      queryClient.clear()
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Sign out failed'
      console.error('Sign out failed:', errorMessage)
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const response = await apiClient.put<ApiResponse<User>>(
        '/auth/profile',
        data
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update profile')
      }

      return response.data!
    },
    onSuccess: (updatedUser) => {
      // Update current user in cache
      queryClient.setQueryData(['currentUser'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update profile'
      console.error('Failed to update profile:', errorMessage)
    },
  })
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.put<ApiResponse<void>>(
        '/auth/change-password',
        data
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to change password')
      }

      return response.data
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to change password'
      console.error('Failed to change password:', errorMessage)
    },
  })
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/forgot-password',
        { email }
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to send reset email')
      }

      return response.data
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send reset email'
      console.error('Failed to send reset email:', errorMessage)
    },
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/reset-password',
        data
      )

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to reset password')
      }

      return response.data
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to reset password'
      console.error('Failed to reset password:', errorMessage)
    },
  })
}

// Legacy useAuth hook for backward compatibility
export function useAuth() {
  const { data: user, isLoading } = useCurrentUser()
  const signInMutation = useSignIn()
  const signUpMutation = useSignUp()
  const signOutMutation = useSignOut()
  const updateProfileMutation = useUpdateProfile()

  return {
    user,
    isLoading,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  }
}