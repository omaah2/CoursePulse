import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Course, Task } from '../types'

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation(
    async (payload: Partial<Course>) => {
      const { data: session } = await supabase.auth.getSession()
      const { data, error } = await supabase.from('courses').insert({ ...payload, user_id: session.session?.user?.id }).select().single()
      if (error) throw error
      return data as Course
    },
    {
      onSuccess: () => qc.invalidateQueries(['courses']),
    }
  )
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation(
    async ({ id, changes }: { id: string; changes: Partial<Course> }) => {
      const { data, error } = await supabase.from('courses').update(changes).eq('id', id).select().single()
      if (error) throw error
      return data as Course
    },
    {
      onSuccess: () => qc.invalidateQueries(['courses']),
    }
  )
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation(
    async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
      return id
    },
    {
      onSuccess: () => qc.invalidateQueries(['courses']),
    }
  )
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation(
    async (payload: Partial<Task>) => {
      const { data: session } = await supabase.auth.getSession()
      const { data, error } = await supabase.from('tasks').insert({ ...payload, user_id: session.session?.user?.id, completed: payload.completed ?? false }).select().single()
      if (error) throw error
      return data as Task
    },
    { onSuccess: () => qc.invalidateQueries(['tasks']) }
  )
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation(
    async ({ id, changes }: { id: string; changes: Partial<Task> }) => {
      const { data, error } = await supabase.from('tasks').update(changes).eq('id', id).select().single()
      if (error) throw error
      return data as Task
    },
    { onSuccess: () => qc.invalidateQueries(['tasks']) }
  )
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation(
    async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return id
    },
    { onSuccess: () => qc.invalidateQueries(['tasks']) }
  )
}
