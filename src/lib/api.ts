import { supabase, isSupabaseConfigured } from './supabase'
import type { User, TimeEntry } from '../types'

// ==================== Users API ====================

export async function fetchUsers(): Promise<User[]> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const stored = localStorage.getItem('users')
    return stored ? JSON.parse(stored) : []
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    role: row.role as 'teacher' | 'staff' | 'admin',
    createdAt: new Date(row.created_at).getTime()
  }))
}

export async function createUser(user: User): Promise<User | null> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const users = await fetchUsers()
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))
    return user
  }

  const { data, error } = await supabase!
    .from('users')
    .insert({
      id: user.id,
      name: user.name,
      role: user.role,
      created_at: new Date(user.createdAt).toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role as 'teacher' | 'staff' | 'admin',
    createdAt: new Date(data.created_at).getTime()
  }
}

// ==================== Time Entries API ====================

export async function fetchTimeEntries(): Promise<TimeEntry[]> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const stored = localStorage.getItem('allTimeEntries')
    return stored ? JSON.parse(stored) : []
  }

  const { data, error } = await supabase!
    .from('time_entries')
    .select('*')
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching time entries:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    category: row.category,
    startTime: new Date(row.start_time).getTime(),
    endTime: row.end_time ? new Date(row.end_time).getTime() : undefined,
    duration: row.duration,
    userId: row.user_id,
    notes: row.notes || undefined
  }))
}

export async function createTimeEntry(entry: TimeEntry): Promise<TimeEntry | null> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const entries = await fetchTimeEntries()
    entries.push(entry)
    localStorage.setItem('allTimeEntries', JSON.stringify(entries))
    return entry
  }

  const { data, error } = await supabase!
    .from('time_entries')
    .insert({
      id: entry.id,
      user_id: entry.userId,
      category: entry.category,
      start_time: new Date(entry.startTime).toISOString(),
      end_time: entry.endTime ? new Date(entry.endTime).toISOString() : null,
      duration: entry.duration,
      notes: entry.notes || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating time entry:', error)
    return null
  }

  return {
    id: data.id,
    category: data.category,
    startTime: new Date(data.start_time).getTime(),
    endTime: data.end_time ? new Date(data.end_time).getTime() : undefined,
    duration: data.duration,
    userId: data.user_id,
    notes: data.notes || undefined
  }
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const entries = await fetchTimeEntries()
    const index = entries.findIndex(e => e.id === id)
    if (index === -1) return null

    entries[index] = { ...entries[index], ...updates }
    localStorage.setItem('allTimeEntries', JSON.stringify(entries))
    return entries[index]
  }

  const updateData: any = {}
  if (updates.notes !== undefined) updateData.notes = updates.notes || null
  if (updates.duration !== undefined) updateData.duration = updates.duration
  if (updates.endTime !== undefined) updateData.end_time = new Date(updates.endTime).toISOString()

  const { data, error } = await supabase!
    .from('time_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating time entry:', error)
    return null
  }

  return {
    id: data.id,
    category: data.category,
    startTime: new Date(data.start_time).getTime(),
    endTime: data.end_time ? new Date(data.end_time).getTime() : undefined,
    duration: data.duration,
    userId: data.user_id,
    notes: data.notes || undefined
  }
}

export async function deleteTimeEntry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const entries = await fetchTimeEntries()
    const filtered = entries.filter(e => e.id !== id)
    localStorage.setItem('allTimeEntries', JSON.stringify(filtered))
    return true
  }

  const { error } = await supabase!
    .from('time_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting time entry:', error)
    return false
  }

  return true
}

// ==================== Search API ====================

export async function searchNotes(query: string): Promise<TimeEntry[]> {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage with simple text search
    const entries = await fetchTimeEntries()
    return entries.filter(e =>
      e.notes && e.notes.toLowerCase().includes(query.toLowerCase())
    )
  }

  const { data, error } = await supabase!
    .rpc('search_notes', { search_query: query })

  if (error) {
    console.error('Error searching notes:', error)
    return []
  }

  return data.map((row: any) => ({
    id: row.id,
    category: row.category,
    startTime: new Date(row.start_time).getTime(),
    endTime: undefined,
    duration: row.duration,
    userId: row.user_id,
    notes: row.notes
  }))
}
