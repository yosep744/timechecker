import { createClient } from '@supabase/supabase-js'

// Supabase 설정 - Lovable 배포용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://valkewjzosxflxzngjlf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbGtld2p6b3N4Zmx4em5namxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDY3MjEsImV4cCI6MjA3OTIyMjcyMX0.Djngfs5Afg03dSG2Y415W_5N2dSgQ-DYd2jPM1emQvE'

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = !!supabase
