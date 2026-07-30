'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle, Clock, Lock, PlayCircle, ShoppingCart } from 'lucide-react'
import CourseHeader from '@/components/courses/CourseHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiFetch, formatPrice, getStoredUser } from '@/lib/courseClient'

export default function CourseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  const loadCourse = () => {
    apiFetch(`/courses/${id}`)
      .then(setCourse)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadCourse, [id])

  const purchase = async () => {
    if (!getStoredUser()) {
      router.push(`/login?next=/cursos/${id}`)
      return
    }
    setBuying(true)
    try {
      await apiFetch(`/courses/${id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ provider: 'simulated' }),
      })
      router.push(`/mis-cursos/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBuying(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <CourseHeader />
      {loading && <p className="p-10 text-center text-slate-500">Cargando curso...</p>}
      {error && <p className="m-10 rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</p>}
      {course && (
        <>
          <section className="bg-slate-950 text-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.75fr] lg:px-8">
              <div>
                <Badge className="mb-4 bg-cyan-500">{course.level}</Badge>
                <h1 className="text-4xl font-bold md:text-5xl">{course.title}</h1>
                <p className="mt-5 text-lg leading-relaxed text-slate-300">{course.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {course.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {course.isEnrolled ? (
                    <Button size="lg" asChild><Link href={`/mis-cursos/${course.id}`}>Continuar curso</Link></Button>
                  ) : (
                    <Button size="lg" onClick={purchase} disabled={buying}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {buying ? 'Procesando...' : course.price ? `Comprar ${formatPrice(course.price)}` : 'Inscribirme gratis'}
                    </Button>
                  )}
                  <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10" asChild>
                    <a href="#contenido">Ver contenido</a>
                  </Button>
                </div>
              </div>
              <img src={course.image} alt={course.title} className="h-full max-h-[420px] w-full rounded-lg object-cover shadow-2xl" />
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle>Que aprenderas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-600">
                <p>{course.intro}</p>
                <div className="grid gap-3 text-sm">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Duracion: {course.duration}</span>
                  <span className="flex items-center gap-2"><PlayCircle className="h-4 w-4 text-primary" />{course.lessonCount} lecciones</span>
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" />Vista previa gratis incluida</span>
                </div>
              </CardContent>
            </Card>

            <div id="contenido" className="space-y-5">
              {course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <p className="text-sm text-slate-500">{module.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-slate-500">{lesson.duration} {lesson.isFreePreview ? '· preview gratis' : ''}</p>
                        </div>
                        {lesson.isLocked ? <Lock className="h-5 w-5 text-slate-400" /> : <Button variant="outline" asChild><Link href={`/mis-cursos/${course.id}?lesson=${lesson.id}`}>Ver</Link></Button>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
