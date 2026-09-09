import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Task } from '../types'

export function useTasks() {
  return useQuery<Task[], Error>(['tasks'], async () => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) throw error
    return data as Task[]
  })
}
