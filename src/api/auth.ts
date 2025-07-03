import { supabase } from '@/lib/supabase'
import { Student, Educator } from '@/types'

export interface QRAuthResponse {
  student: Student
  token: string
  expires_at: string
}

export interface StaffAuthResponse {
  educator: Educator
  token: string
  expires_at: string
}

export const authenticateStudentQR = async (qrData: string): Promise<QRAuthResponse> => {
  try {
    // Call edge function to validate QR and get student data
    const { data, error } = await supabase.functions.invoke('authenticate-qr', {
      body: { qr_data: qrData }
    })

    if (error) {
      throw new Error(`QR authentication failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('QR authentication error:', error)
    throw error
  }
}

export const authenticateStaff = async (email: string, password: string): Promise<StaffAuthResponse> => {
  try {
    // Call edge function for staff authentication
    const { data, error } = await supabase.functions.invoke('authenticate-staff', {
      body: { email, password }
    })

    if (error) {
      throw new Error(`Staff authentication failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Staff authentication error:', error)
    throw error
  }
}

export const refreshAuthToken = async (token: string): Promise<{ token: string; expires_at: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('refresh-token', {
      body: { token }
    })

    if (error) {
      throw new Error(`Token refresh failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

export const logout = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem('tess_auth_token')
  localStorage.removeItem('tess_user_data')
  localStorage.removeItem('tess_user_type')
}