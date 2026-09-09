import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Course } from '../types'

export function useCourses() {
  return useQuery<Course[], Error>(['courses'], async () => {
    const { data, error } = await supabase.from('courses').select('*')
    if (error) throw error
    return data as Course[]
  })
}
