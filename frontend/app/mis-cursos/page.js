'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import CourseCard from '@/components/courses/CourseCard'
import CourseHeader from '@/components/courses/CourseHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiFetch, getStoredUser } from '@/lib/courseClient'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    const user = getStoredUser()
    setHasUser(Boolean(user))
    if (!user) {
      setLoading(false)
      return
    }
    apiFetch('/me/courses')
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      <CourseHeader />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Badge className="mb-4">Alumno</Badge>
        <h1 className="text-4xl font-bold text-slate-950">Mis cursos</h1>
        <p className="mt-3 text-slate-600">Continua donde quedaste y revisa tu progreso.</p>

        {!hasUser && (
          <div className="mt-8 rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-600">Inicia sesion para ver tus cursos.</p>
            <Button asChild><Link href="/login?next=/mis-cursos">Entrar</Link></Button>
          </div>
        )}
        {loading && <p className="mt-8 rounded-lg bg-white p-8 text-center text-slate-500">Cargando...</p>}
        {error && <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</p>}
        {hasUser && !loading && !error && courses.length === 0 && (
          <div className="mt-8 rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-600">Aun no tienes cursos inscritos.</p>
            <Button asChild><Link href="/cursos">Explorar catalogo</Link></Button>
          </div>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.id} course={course} owned />)}
        </div>
      </section>
    </main>
  )
}
