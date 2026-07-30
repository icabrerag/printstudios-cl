'use client'

import { useEffect, useMemo, useState } from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react'
import CourseHeader from '@/components/courses/CourseHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch, getStoredUser } from '@/lib/courseClient'

function LearnCourseContent() {
  const { id } = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const selectedLessonId = search.get('lesson')
  const lessons = useMemo(() => course?.modules?.flatMap((module) => module.lessons) || [], [course])
  const activeLessonId = selectedLessonId || lessons[0]?.id

  const loadCourse = () => {
    if (!getStoredUser()) {
      router.push(`/login?next=/mis-cursos/${id}`)
      return
    }
    apiFetch(`/me/courses/${id}`)
      .then((data) => {
        setCourse(data)
        if ((data.progress || 0) >= 100) {
          apiFetch('/me/certificates')
            .then((certificates) => setCertificate(certificates.find((item) => item.courseId === data.id) || null))
            .catch(() => {})
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadCourse, [id])

  useEffect(() => {
    if (!activeLessonId) return
    apiFetch(`/courses/${id}/lessons/${activeLessonId}`)
      .then(setLesson)
      .catch((err) => setError(err.message))
  }, [activeLessonId, id])

  const completeLesson = async () => {
    if (!lesson) return
    const result = await apiFetch(`/lessons/${lesson.id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ completed: true }),
    })
    setLesson({ ...lesson, isCompleted: true })
    setCourse({ ...course, progress: result.courseProgress })
    loadCourse()
  }

  const issueCertificate = async () => {
    const cert = await apiFetch(`/me/courses/${id}/certificate`, { method: 'POST', body: JSON.stringify({}) })
    setCertificate(cert)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <CourseHeader />
      {loading && <p className="p-10 text-center text-slate-500">Cargando curso...</p>}
      {error && <p className="m-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{error}</p>}
      {course && (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <Badge className="w-fit">Progreso {course.progress || 0}%</Badge>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {course.progress >= 100 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-medium text-emerald-800">Curso completado</p>
                    {certificate ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-emerald-700">Certificado: {certificate.certificateCode}</p>
                        <Button asChild className="w-full" size="sm" variant="outline">
                          <Link href={`/certificados/${certificate.certificateCode}`}>Ver certificado</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button className="mt-3 w-full" size="sm" onClick={issueCertificate}>Emitir certificado</Button>
                    )}
                  </div>
                )}
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="mb-2 font-semibold">{module.title}</h3>
                    <div className="space-y-2">
                      {module.lessons.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => router.push(`/mis-cursos/${course.id}?lesson=${item.id}`)}
                          className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition hover:border-primary ${activeLessonId === item.id ? 'border-primary bg-blue-50' : 'bg-white'}`}
                        >
                          {item.isLocked ? <Lock className="h-4 w-4 text-slate-400" /> : item.isCompleted ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-400" />}
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <section>
            <Card className="overflow-hidden">
              {lesson?.isLocked ? (
                <CardContent className="p-10 text-center">
                  <Lock className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                  <h2 className="text-2xl font-bold">Leccion bloqueada</h2>
                  <p className="mt-2 text-slate-600">Compra el curso para desbloquear esta clase.</p>
                </CardContent>
              ) : (
                <>
                  <div className="flex aspect-video items-center justify-center bg-slate-950 text-white">
                    <div className="text-center">
                      <PlayCircle className="mx-auto mb-3 h-16 w-16 text-cyan-300" />
                      <p className="text-sm text-slate-300">Video placeholder. Preparado para Vimeo, YouTube privado, S3 o R2.</p>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{lesson?.title || 'Selecciona una leccion'}</CardTitle>
                    <p className="text-sm text-slate-500">{lesson?.duration}</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="leading-relaxed text-slate-700">{lesson?.content}</p>
                    {lesson && !lesson.isCompleted && (
                      <Button onClick={completeLesson}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como completada
                      </Button>
                    )}
                    {lesson?.isCompleted && <p className="font-medium text-emerald-700">Leccion completada.</p>}
                  </CardContent>
                </>
              )}
            </Card>
          </section>
        </section>
      )}
    </main>
  )
}

export default function LearnCoursePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50"><CourseHeader /><p className="p-10 text-center text-slate-500">Cargando...</p></main>}>
      <LearnCourseContent />
    </Suspense>
  )
}
