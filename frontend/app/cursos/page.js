'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Box, PlayCircle, Sparkles } from 'lucide-react'
import CourseCard from '@/components/courses/CourseCard'
import CourseHeader from '@/components/courses/CourseHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { apiFetch } from '@/lib/courseClient'
import Link from 'next/link'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/courses')
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      <CourseHeader />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.45),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.28),_transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <Badge className="mb-5 bg-cyan-500 text-white">Academia PrintStudios</Badge>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">Aprende modelado e impresion 3D con proyectos reales</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              Cursos practicos para crear piezas, preparar archivos, prototipar productos y vender objetos personalizados con criterio profesional.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">
              El modelado 3D es el proceso de construir una pieza digital con medidas, volumen y detalles antes de fabricarla. Sirve para validar ideas, disenar repuestos, crear figuras, corregir encajes y preparar archivos STL/OBJ/BLEND que luego se llevan a impresion 3D con materiales como PLA, PETG, TPU o resina.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <a href="#catalogo">Ver catalogo</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10" asChild>
                <Link href="/registro">Crear cuenta gratis</Link>
              </Button>
            </div>
          </div>
          <Card className="border-white/10 bg-white/10 text-white backdrop-blur">
            <CardContent className="space-y-6 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                <PlayCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Introduccion gratuita</h2>
                <p className="mt-2 text-slate-200">
                  Mira clases de vista previa y entiende el flujo completo: idea, modelo, STL, laminado, material y pieza final.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Partimos desde conceptos simples y avanzamos hacia proyectos aplicables al taller, emprendimientos creativos y productos personalizados PrintStudios.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-200">
                <span className="flex items-center gap-2"><Box className="h-4 w-4 text-cyan-300" />Que puedes imprimir y que conviene evitar</span>
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-cyan-300" />Rutas recomendadas para partir desde cero</span>
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-300" />Ideas para productos personalizados</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge className="mb-3">Catalogo</Badge>
            <h2 className="text-3xl font-bold text-slate-950">Cursos disponibles</h2>
            <p className="mt-2 text-slate-600">Empieza con previews gratis y desbloquea el contenido completo cuando estes listo.</p>
          </div>
        </div>
        {loading && <p className="rounded-lg bg-white p-8 text-center text-slate-500">Cargando cursos...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</p>}
        {!loading && !error && courses.length === 0 && <p className="rounded-lg bg-white p-8 text-center text-slate-500">No hay cursos publicados.</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>
    </main>
  )
}
