'use client'

import Link from 'next/link'
import { ArrowRight, Clock, GraduationCap, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/courseClient'

export default function CourseCard({ course, owned = false }) {
  return (
    <Card className="group overflow-hidden border-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <Badge className="absolute left-4 top-4 bg-white text-slate-950 hover:bg-white">{course.level}</Badge>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <span className="whitespace-nowrap font-bold text-primary">{formatPrice(course.price)}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{course.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(course.tags || []).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</span>
          <span className="flex items-center gap-2"><Layers className="h-4 w-4" />{course.lessonCount} lecciones</span>
          {owned && <span className="col-span-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" />Progreso {course.progress || 0}%</span>}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={owned ? `/mis-cursos/${course.id}` : `/cursos/${course.id}`}>
            {owned ? 'Continuar' : 'Ver curso'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
