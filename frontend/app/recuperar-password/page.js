'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import CourseHeader from '@/components/courses/CourseHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/courseClient'

function PasswordRecoveryContent() {
  const search = useSearchParams()
  const token = search.get('token')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (token) {
        await apiFetch('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password }),
        })
        setMessage('Password actualizado. Ya puedes iniciar sesion.')
      } else {
        await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        })
        setMessage('Si el email existe, se genero una notificacion con el link de recuperacion.')
      }
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
            <CardTitle>{token ? 'Crear nuevo password' : 'Recuperar password'}</CardTitle>
            <p className="text-sm text-slate-500">
              {token ? 'Ingresa tu nuevo password.' : 'Te enviaremos un link de recuperacion al email registrado.'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {token ? (
                <div className="space-y-2">
                  <Label>Nuevo password</Label>
                  <Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              )}
              {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {message && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
              <Button className="w-full" disabled={loading}>{loading ? 'Procesando...' : 'Continuar'}</Button>
            </form>
            <p className="mt-5 text-center text-sm"><Link href="/login" className="font-medium text-primary">Volver al login</Link></p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default function PasswordRecoveryPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50"><CourseHeader /><p className="p-10 text-center text-slate-500">Cargando...</p></main>}>
      <PasswordRecoveryContent />
    </Suspense>
  )
}
