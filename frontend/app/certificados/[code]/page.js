'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Calendar, CheckCircle2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CertificatePage({ params }) {
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/certificates/${params.code}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.detail || 'Certificado no encontrado')
        return data
      })
      .then(setCertificate)
      .catch((err) => setError(err.message))
  }, [params.code])

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <Award className="h-12 w-12 mx-auto text-blue-300" />
          <h1 className="text-2xl font-bold">Certificado no encontrado</h1>
          <p className="text-slate-300">{error}</p>
          <Button asChild><Link href="/cursos">Ver cursos</Link></Button>
        </div>
      </main>
    )
  }

  if (!certificate) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Validando certificado...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-5 py-10">
      <section className="mx-auto max-w-5xl rounded-2xl border border-blue-300/30 bg-white text-slate-950 shadow-2xl print:shadow-none">
        <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-700">PrintStudios Cursos</p>
            <h1 className="text-3xl font-black">Certificado de finalizacion</h1>
          </div>
          <Award className="h-14 w-14 text-blue-700" />
        </div>

        <div className="px-8 py-12 text-center space-y-6">
          <p className="text-lg text-slate-600">Se certifica que</p>
          <p className="text-4xl font-black">{certificate.studentName || 'Alumno PrintStudios'}</p>
          <p className="text-lg text-slate-600">completo satisfactoriamente el curso</p>
          <p className="text-3xl font-bold text-blue-700">{certificate.courseTitle || certificate.courseId}</p>

          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2 pt-8 text-left">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 className="h-4 w-4" /> Codigo</div>
              <p className="mt-1 font-mono text-lg">{certificate.certificateCode}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="h-4 w-4" /> Fecha</div>
              <p className="mt-1 text-lg">{new Date(certificate.issuedAt).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>Verificacion publica de certificado PrintStudios.</p>
          <Button type="button" variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </section>
    </main>
  )
}
