import React, { useMemo, useState } from 'react'
import { useCourses } from '../hooks/useCourses'
import CourseForm from '../components/CourseForm'
import { useDeleteCourse } from '../hooks/mutations'
import Skeleton from '../components/Skeleton'

export default function Courses() {
  const { data, isLoading, error } = useCourses()
  const [open, setOpen] = useState<null | Partial<any>>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'progress' | 'name'>('progress')
  const del = useDeleteCourse()
  const courses = useMemo(() => (data ?? []).filter(course => `${course.code ?? ''} ${course.title}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'name' ? a.title.localeCompare(b.title) : (b.progress ?? 0) - (a.progress ?? 0)), [data, search, sort])
  const averageProgress = data?.length ? Math.round(data.reduce((total, course) => total + (course.progress ?? 0), 0) / data.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-emerald-600">Your semester workspace</p><h1 className="text-3xl font-semibold tracking-tight">Courses</h1><p className="text-gray-500 mt-1">Keep every class, milestone, and deadline in one place.</p></div>
        <button onClick={() => setOpen({})} className="px-4 py-2.5 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-700">+ Add course</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Active courses', data?.length ?? 0, 'Classes on your board'], ['Average progress', `${averageProgress}%`, 'Across all courses'], ['On track', data?.filter(c => (c.progress ?? 0) >= 70).length ?? 0, 'At 70% or above'], ['Needs focus', data?.filter(c => (c.progress ?? 0) < 50).length ?? 0, 'Below 50% progress']].map(([label, value, hint]) => <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><p className="text-2xl font-semibold mt-2">{value}</p><p className="text-xs text-gray-500 mt-1">{hint}</p></div>)}
      </div>

      <div className="flex flex-col sm:flex-row gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200" /><select value={sort} onChange={e => setSort(e.target.value as 'progress' | 'name')} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5"><option value="progress">Sort by progress</option><option value="name">Sort by name</option></select></div>

      {error && <div className="text-red-600">Error: {error.message}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {(!data || data.length === 0) ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-lg font-semibold">No courses yet</h3>
              <p className="text-sm text-gray-500 mt-2">Add your first course to track progress, tasks, and materials.</p>
              <div className="mt-4">
                <button onClick={() => setOpen({})} className="px-4 py-2 bg-green-600 text-white rounded">Add course</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">{c.code ?? 'COURSE'}</div>
                      <h3 className="font-semibold mt-1">{c.title}</h3>
                    </div>
                    <div className="text-emerald-600 font-bold">{c.progress ?? 0}%</div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mt-5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.progress ?? 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-500"><span>{(c.progress ?? 0) >= 70 ? 'On track' : 'Needs attention'}</span><div className="flex gap-2"><button onClick={() => setOpen(c)} className="px-2.5 py-1 rounded-md border hover:bg-gray-50">Edit</button><button onClick={() => del.mutateAsync(c.id)} className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50">Delete</button></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {open !== null && <CourseForm initial={open?.id ? open : undefined} onClose={() => setOpen(null)} />}
    </div>
  )
}
