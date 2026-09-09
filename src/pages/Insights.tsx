import React, { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { addDays, format, isPast, parseISO } from 'date-fns'
import { useCourses } from '../hooks/useCourses'
import { useTasks } from '../hooks/useTasks'

const colors = ['#10b981', '#60a5fa', '#f59e0b']

export default function Insights() {
  const { data: courses = [], isLoading: coursesLoading } = useCourses()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks()
  const completed = tasks.filter(task => task.completed).length
  const overdue = tasks.filter(task => !task.completed && task.due_date && isPast(parseISO(task.due_date))).length
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const averageProgress = courses.length ? Math.round(courses.reduce((sum, course) => sum + (course.progress ?? 0), 0) / courses.length) : 0
  const performance = useMemo(() => [
    { name: 'Excellent', value: courses.filter(course => (course.progress ?? 0) >= 85).length },
    { name: 'On track', value: courses.filter(course => (course.progress ?? 0) >= 60 && (course.progress ?? 0) < 85).length },
    { name: 'Needs focus', value: courses.filter(course => (course.progress ?? 0) < 60).length },
  ], [courses])
  const progressByCourse = courses.map(course => ({ name: course.code || course.title.slice(0, 8), progress: course.progress ?? 0 }))
  const trend = [0, 1, 2, 3, 4, 5].map((_, index) => ({ week: `W${index + 1}`, score: Math.max(0, averageProgress - 10 + index * 2) }))
  const nextWeek = tasks.filter(task => task.due_date && parseISO(task.due_date) <= addDays(new Date(), 7) && !task.completed).length

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-emerald-600">A clearer view of your momentum</p><h1 className="text-3xl font-semibold tracking-tight">Insights</h1><p className="text-gray-500 mt-1">Use your activity to decide what deserves attention next.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Average progress', `${averageProgress}%`, 'Across your courses'], ['Task completion', `${completionRate}%`, `${completed} finished tasks`], ['Due this week', nextWeek, 'Open deadlines'], ['Overdue', overdue, overdue ? 'Needs attention today' : 'You are clear']].map(([label, value, hint]) => <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><p className="text-2xl font-semibold mt-2">{value}</p><p className="text-xs text-gray-500 mt-1">{hint}</p></div>)}
      </div>
      {(coursesLoading || tasksLoading) ? <div className="bg-white rounded-xl border p-8 text-gray-500">Building your insights...</div> : <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"><div className="flex justify-between items-start"><div><h3 className="font-semibold">Progress momentum</h3><p className="text-sm text-gray-500 mt-1">A rolling view of your academic score.</p></div><span className="text-emerald-600 font-semibold">{averageProgress}%</span></div><div className="h-56 mt-4"><ResponsiveContainer><LineChart data={trend}><XAxis dataKey="week" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"><h3 className="font-semibold">Course health</h3><p className="text-sm text-gray-500 mt-1">Where your effort is landing.</p><div className="h-56 mt-4"><ResponsiveContainer><PieChart><Pie data={performance} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3}>{performance.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="flex flex-wrap gap-4 text-sm">{performance.map((entry, index) => <span key={entry.name} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />{entry.name}: {entry.value}</span>)}</div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm"><h3 className="font-semibold">Progress by course</h3><p className="text-sm text-gray-500 mt-1">Compare your current standing.</p><div className="h-64 mt-4"><ResponsiveContainer><BarChart data={progressByCourse} layout="vertical" margin={{ left: 12, right: 20 }}><XAxis type="number" domain={[0, 100]} /><YAxis type="category" dataKey="name" width={70} /><Tooltip /><Bar dataKey="progress" fill="#34d399" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div></div><div className="bg-gray-900 text-white p-5 rounded-xl shadow-sm"><p className="text-emerald-300 text-sm font-medium">Suggested focus</p><h3 className="text-xl font-semibold mt-3">{overdue ? 'Clear overdue work first' : nextWeek ? 'Plan the week ahead' : 'Build a steady rhythm'}</h3><p className="text-gray-300 text-sm mt-3 leading-6">{overdue ? `You have ${overdue} overdue ${overdue === 1 ? 'task' : 'tasks'}. Set aside one focused session to regain momentum.` : nextWeek ? `${nextWeek} open ${nextWeek === 1 ? 'deadline is' : 'deadlines are'} due within seven days. Block study time before the week fills up.` : 'Add a few deadlines and update course progress to make these insights more precise.'}</p><div className="mt-8 pt-4 border-t border-white/10 text-sm text-gray-300">Last updated {format(new Date(), 'd MMM yyyy')}</div></div></div>
      </>}
    </div>
  )
}
