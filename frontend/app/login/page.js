'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import CourseHeader from '@/components/courses/CourseHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch, saveSession } from '@/lib/courseClient'

function LoginContent() {
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      saveSession(data.token, data.user)
      router.push(search.get('next') || '/mis-cursos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <CourseHeader />
      <section className="mx-auto flex max-w-md px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Iniciar sesion</CardTitle>
            <p className="text-sm text-slate-500">Accede a tus cursos y progreso.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <Button className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500">
              No tienes cuenta? <Link className="font-medium text-primary" href="/registro">Registrate</Link>
            </p>
            <p className="mt-2 text-center text-sm">
              <Link className="font-medium text-primary" href="/recuperar-password">Olvide mi password</Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50"><CourseHeader /><p className="p-10 text-center text-slate-500">Cargando...</p></main>}>
      <LoginContent />
    </Suspense>
  )
}
