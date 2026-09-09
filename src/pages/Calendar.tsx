import React from 'react'
import FullCalendar, { EventInput, DateSelectArg, EventApi } from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useTasks } from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import { useUpdateTask, useCreateTask } from '../hooks/mutations'
import { Task } from '../types'
import { useState } from 'react'
import { formatISO } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '../components/ToastProvider'

export default function Calendar() {
  const { data: tasks } = useTasks()
  const update = useUpdateTask()
  const create = useCreateTask()
  const qc = useQueryClient()
  const addToast = useToast()
  const [openTask, setOpenTask] = useState<Partial<Task> | null>(null)

  const events: EventInput[] = (tasks ?? []).map(t => ({
    id: t.id,
    title: t.title,
    start: t.due_date ?? undefined,
    allDay: true,
  }))

  const handleDateClick = (arg: DateSelectArg) => {
    // optimistic create a new task on that date and open it for editing
    const dateStr = formatISO(arg.start, { representation: 'date' })
    const due_iso = new Date(dateStr).toISOString()

    // prepare optimistic task
    const tempId = `temp-${Math.random().toString(36).slice(2, 9)}`
    const optimisticTask: Task = { id: tempId, title: 'New task', due_date: due_iso, priority: 'Low' }

    const previous = qc.getQueryData<Task[]>(['tasks'])
    qc.setQueryData(['tasks'], (old: Task[] | undefined) => {
      return old ? [optimisticTask, ...old] : [optimisticTask]
    })

    // open modal with optimistic task
    setOpenTask(optimisticTask)

    // call create mutation
    create.mutate(
      { title: 'New task', due_date: due_iso },
      {
        onSuccess(newTask) {
          // replace temp with real
          qc.setQueryData(['tasks'], (old: Task[] | undefined) => {
            if (!old) return [newTask]
            return old.map(t => (t.id === tempId ? newTask : t))
          })
          setOpenTask(newTask)
          addToast({ message: 'Task created', type: 'success' })
        },
        onError(err) {
          qc.setQueryData(['tasks'], previous)
          addToast({ message: 'Failed to create task', type: 'error' })
        },
      }
    )
  }

  const handleEventClick = (clickInfo: { event: EventApi }) => {
    const id = clickInfo.event.id
    const selected = (tasks ?? []).find(t => t.id === id)
    if (selected) setOpenTask(selected)
  }

  const handleEventDrop = async (dropInfo: { event: EventApi }) => {
    const id = dropInfo.event.id
    const newDate = dropInfo.event.start
    if (!newDate) return

    // optimistic update in cache
    const previous = qc.getQueryData<Task[]>(['tasks'])
    qc.setQueryData(['tasks'], (old: Task[] | undefined) => old?.map(t => (t.id === id ? { ...t, due_date: newDate.toISOString() } : t)))

    try {
      await update.mutateAsync({ id, changes: { due_date: newDate.toISOString() } })
      addToast({ message: 'Task date updated', type: 'success' })
    } catch (e) {
      qc.setQueryData(['tasks'], previous)
      addToast({ message: 'Failed to update date', type: 'error' })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height={600}
          selectable={true}
          editable={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
        />
      </div>

      {openTask && <TaskForm initial={openTask} onClose={() => setOpenTask(null)} />}
    </div>
  )
}
