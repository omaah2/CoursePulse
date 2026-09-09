import React, { useMemo, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import { useDeleteTask, useUpdateTask } from '../hooks/mutations'
import { useCourses } from '../hooks/useCourses'
import { format, isPast, isToday, parseISO } from 'date-fns'
import Skeleton from '../components/Skeleton'

export default function Tasks() {
  const { data, isLoading, error } = useTasks()
  const [open, setOpen] = useState<null | Partial<any>>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [priority, setPriority] = useState('All')
  const [search, setSearch] = useState('')
  const del = useDeleteTask()
  const update = useUpdateTask()
  const { data: courses } = useCourses()
  const courseName = (id?: string) => courses?.find(course => course.id === id)?.title
  const tasks = useMemo(() => (data ?? []).filter(task => filter === 'all' || (filter === 'done' ? task.completed : !task.completed)).filter(task => priority === 'All' || task.priority === priority).filter(task => task.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(a.completed) - Number(b.completed)), [data, filter, priority, search])
  const dueSoon = data?.filter(task => !task.completed && task.due_date && (isToday(parseISO(task.due_date)) || isPast(parseISO(task.due_date)))).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="text-sm font-medium text-emerald-600">Stay ahead of the week</p><h1 className="text-3xl font-semibold tracking-tight">Tasks</h1><p className="text-gray-500 mt-1">Turn deadlines into small, finishable wins.</p></div><button onClick={() => setOpen({})} className="px-4 py-2.5 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-gray-700">+ Add task</button>
      </div>

      <div className="grid grid-cols-3 gap-3"><div className="bg-white border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase tracking-wide">Total tasks</p><p className="text-2xl font-semibold mt-2">{data?.length ?? 0}</p></div><div className="bg-white border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase tracking-wide">Completed</p><p className="text-2xl font-semibold mt-2 text-emerald-600">{data?.filter(t => t.completed).length ?? 0}</p></div><div className="bg-white border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase tracking-wide">Due now</p><p className="text-2xl font-semibold mt-2 text-rose-600">{dueSoon}</p></div></div>

      <div className="flex flex-col lg:flex-row gap-3"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5" /><div className="flex gap-2"><select value={filter} onChange={e => setFilter(e.target.value as 'all' | 'open' | 'done')} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5"><option value="all">All tasks</option><option value="open">Open</option><option value="done">Completed</option></select><select value={priority} onChange={e => setPriority(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>

      {error && <div className="text-red-600">Error: {error.message}</div>}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {(!data || data.length === 0) ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="text-lg font-semibold">No tasks yet</h3>
              <p className="text-sm text-gray-500 mt-2">Create tasks to track deadlines and priorities.</p>
              <div className="mt-4">
                <button onClick={() => setOpen({})} className="px-4 py-2 bg-green-600 text-white rounded">Add task</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.length === 0 && <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">No tasks match these filters.</div>}
              {tasks.map(t => (
                <div key={t.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${t.completed ? 'opacity-65' : ''}`}>
                  <div className="flex items-start gap-3"><button type="button" aria-label={`Mark ${t.title} ${t.completed ? 'open' : 'complete'}`} onClick={() => update.mutate({ id: t.id, changes: { completed: !t.completed } })} className={`mt-1 h-5 w-5 rounded-full border-2 flex-shrink-0 ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>{t.completed ? '✓' : ''}</button><div><div className={`font-medium ${t.completed ? 'line-through' : ''}`}>{t.title}</div><div className="text-sm text-gray-500 mt-1">{courseName(t.course_id) ?? 'Personal task'} · {t.due_date ? format(parseISO(t.due_date), 'EEE, d MMM') : 'No due date'}</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${t.priority === 'High' ? 'bg-red-100 text-red-600' : t.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {t.priority ?? 'Low'}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setOpen(t)} className="px-2.5 py-1 rounded-md border hover:bg-gray-50">Edit</button>
                      <button onClick={() => del.mutateAsync(t.id)} className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {open !== null && <TaskForm initial={open?.id ? open : undefined} onClose={() => setOpen(null)} />}
    </div>
  )
}
