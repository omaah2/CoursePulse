export type Course = {
  id: string
  code?: string
  title: string
  progress?: number
  user_id?: string
}

export type Task = {
  id: string
  course_id?: string
  title: string
  due_date?: string | null
  priority?: 'Low' | 'Medium' | 'High'
  completed?: boolean
  user_id?: string
}
