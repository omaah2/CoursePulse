import React, { useEffect, useState } from 'react'
import { Task } from '../types'
import { useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/mutations'
import { useCourses } from '../hooks/useCourses'

export default function TaskForm({
  initial,
  onClose,
}: {
  initial?: Partial<Task>
  onClose: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.split('T')[0] : '')
  const [priority, setPriority] = useState(initial?.priority ?? 'Low')
  const [courseId, setCourseId] = useState(initial?.course_id ?? '')
  const { data: courses } = useCourses()

  const create = useCreateTask()
  const update = useUpdateTask()
  const del = useDeleteTask()
  const loading = create.isLoading || update.isLoading || del.isLoading

  useEffect(() => {
    setTitle(initial?.title ?? '')
    setDueDate(initial?.due_date ? initial.due_date.split('T')[0] : '')
    setPriority(initial?.priority ?? 'Low')
    setCourseId(initial?.course_id ?? '')
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    const payload: Partial<Task> = { title, priority }
    if (dueDate) payload.due_date = new Date(dueDate).toISOString()
    if (courseId) payload.course_id = courseId
    try {
      if (initial?.id) {
        await update.mutateAsync({ id: initial.id, changes: payload })
      } else {
        await create.mutateAsync(payload)
      }
      onClose()
    } catch (err: any) {
      alert(err?.message ?? 'Failed to save task')
    }
  }

  const handleDelete = async () => {
    if (!initial?.id) return
    if (!confirm('Delete this task?')) return
    await del.mutateAsync(initial.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{initial?.id ? 'Edit task' : 'Add task'}</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded mb-2" />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded mb-2" />
        <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">No course linked</option>
          {(courses ?? []).map(course => <option key={course.id} value={course.id}>{course.code ? `${course.code} - ` : ''}{course.title}</option>)}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full p-2 border rounded mb-4">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <div className="flex gap-2 justify-end">
          {initial?.id && (
            <button type="button" onClick={handleDelete} disabled={loading} className="px-3 py-2 rounded bg-red-100 text-red-600 disabled:opacity-50">Delete</button>
          )}
          <button type="button" onClick={onClose} disabled={loading} className="px-3 py-2 rounded border disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
