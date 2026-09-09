import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useCourses } from '../hooks/useCourses'
import { useTasks } from '../hooks/useTasks'
import { format, parseISO, isToday } from 'date-fns'
import Skeleton from '../components/Skeleton'
import Avatar from '../components/Avatar'
import IconBell from '../components/IconBell'
import KpiCard from '../components/KpiCard'

export default function Dashboard() {
  const { data: courses, isLoading: loadingCourses } = useCourses()
  const { data: tasks, isLoading: loadingTasks } = useTasks()

  const courseCount = courses?.length ?? 0
  const taskCount = tasks?.length ?? 0

  const urgentTasks = tasks?.filter(t => t.priority === 'High') ?? []
  const upcomingThisWeek = tasks?.filter(t => t.due_date && !isToday(parseISO(t.due_date))) ?? []

  // sample GPA chart data (placeholder) derived from courses count
  const gpaData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({ name: `W${i + 1}`, gpa: 3.6 + (i * 0.1) }))
  }, [courseCount])

  // sample pie data based on course progress
  const pieData = useMemo(() => {
    const excellent = (courses || []).filter(c => (c.progress ?? 0) >= 85).length
    const good = (courses || []).filter(c => (c.progress ?? 0) >= 65 && (c.progress ?? 0) < 85).length
    const avg = (courses || []).filter(c => (c.progress ?? 0) < 65).length
    return [
      { name: 'Excellent', value: excellent },
      { name: 'Good', value: good },
      { name: 'Average', value: avg },
    ]
  }, [courses])

  const academicHealth = Math.round(((courses || []).reduce((s, c) => s + (c.progress ?? 0), 0) / Math.max(1, (courses || []).length)) || 82)

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Good morning, Omaah</h1>
          <div className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, d MMMM')}</div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none">
            <input aria-label="Search" placeholder="Search anything..." className="w-full p-2 border rounded" />
          </div>
          <button type="button" aria-label="Notifications" className="px-3 py-2 bg-white border rounded shadow flex items-center gap-2"><IconBell /> </button>
          <div className="p-1" />
          <Avatar name="Omaah" />
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Academic health */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm text-gray-500">Academic Health</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-3xl font-bold">{academicHealth}%</div>
                <div className="text-sm text-gray-500">You're on track</div>
              </div>

              <div className="mt-4">
                <div className="h-3 bg-gray-100 rounded overflow-hidden">
                  <div className="bg-green-400 h-full" style={{ width: `${academicHealth}%` }} />
                </div>
              </div>
            </div>

            <div className="w-28 h-28 bg-green-50 rounded flex items-center justify-center text-3xl">📚</div>
          </div>
        </div>

        {/* Middle column: KPI cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Urgent Tasks" value={urgentTasks.length} subtitle="Needs attention" color="red" />
          <KpiCard title="Exams" value={(tasks || []).filter(t => !!t.due_date).length} subtitle="This semester" color="blue" />
          <KpiCard title="Courses" value={courseCount} subtitle="Active" color="green" />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-gray-500">What needs your attention?</h3>
              <a className="text-sm text-green-600">View all tasks</a>
            </div>

            <div className="mt-3 space-y-3">
              {loadingTasks ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : (
                (urgentTasks.slice(0, 3).map(t => (
                  <div key={t.id} className="p-3 rounded border flex items-start justify-between bg-red-50">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-gray-500">Due: {t.due_date ? format(parseISO(t.due_date), 'd MMM, p') : 'No due date'}</div>
                    </div>
                    <div className="text-sm text-red-600">High</div>
                  </div>
                )) || <div className="text-sm text-gray-500">No urgent tasks</div>)
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-gray-500">Today's schedule</h3>
              <a className="text-sm text-green-600">View full day</a>
            </div>

            <div className="mt-3 space-y-2">
              {loadingTasks ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                (tasks || []).slice(0, 4).map(t => (
                  <div key={t.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.due_date ? format(parseISO(t.due_date), 'p, d MMM') : 'No time'}</div>
                    </div>
                    <div className="text-xs text-gray-400">{t.priority}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Study streak</h3>
          <div className="mt-3">
            <div className="text-2xl font-bold">6 days</div>
            <div className="text-sm text-gray-500 mt-1">Keep it up!</div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${i < 6 ? 'bg-green-400' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm text-gray-500">Upcoming exams</h4>
            <ul className="mt-2 text-sm text-gray-700 space-y-2">
              <li>GET210 — 16 days</li>
              <li>ABE204 — 24 days</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">GPA Tracker</h3>
          <div style={{ width: '100%', height: 200 }} className="mt-2">
            <ResponsiveContainer>
              <LineChart data={gpaData}>
                <XAxis dataKey="name" />
                <YAxis domain={[2, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="gpa" stroke="#34D399" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm text-gray-500">Course performance</h3>
          <div style={{ width: '100%', height: 160 }} className="mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={["#10B981", "#60A5FA", "#F59E0B"][idx % 3]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <div>Excellent: {pieData[0].value}</div>
            <div>Good: {pieData[1].value}</div>
            <div>Average: {pieData[2].value}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
