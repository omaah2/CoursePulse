import React, { useEffect, useState } from 'react'
import { Course } from '../types'
import { useCreateCourse, useUpdateCourse, useDeleteCourse } from '../hooks/mutations'

export default function CourseForm({
  initial,
  onClose,
}: {
  initial?: Partial<Course>
  onClose: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [progress, setProgress] = useState(initial?.progress ?? 0)

  const create = useCreateCourse()
  const update = useUpdateCourse()
  const del = useDeleteCourse()
  const loading = create.isLoading || update.isLoading || del.isLoading

  useEffect(() => {
    setTitle(initial?.title ?? '')
    setCode(initial?.code ?? '')
    setProgress(initial?.progress ?? 0)
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Title is required')
      return
    }
    try {
      if (initial?.id) {
        await update.mutateAsync({ id: initial.id, changes: { title, code, progress } })
      } else {
        await create.mutateAsync({ title, code, progress })
      }
      onClose()
    } catch (err: any) {
      alert(err?.message ?? 'Failed to save')
    }
  }

  const handleDelete = async () => {
    if (!initial?.id) return
    if (!confirm('Delete this course?')) return
    await del.mutateAsync(initial.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">{initial?.id ? 'Edit course' : 'Add course'}</h3>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code (e.g. GET210)" className="w-full p-2 border rounded mb-2" />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded mb-2" />
        <label className="block text-sm text-gray-600 mb-2">Progress: {progress}%</label>
        <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full mb-4" />

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
