'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { clearSession, getStoredUser } from '@/lib/courseClient'

export default function CourseHeader() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const logout = () => {
    clearSession()
    setUser(null)
    window.location.href = '/cursos'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#c5a06d]/20 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/cursos" className="flex items-center gap-2">
          <img src="/assets/brand/printstudios-wordmark-dark-transparent.png" alt="PrintStudios" className="h-10 w-auto sm:h-12" />
          <span className="hidden rounded-full bg-[#c5a06d]/15 px-2 py-1 text-xs font-semibold text-[#2b3940] sm:inline">Cursos</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/cursos">Catalogo</Link>
          </Button>
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/mis-cursos">
                  <UserRound className="mr-2 h-4 w-4" />
                  Mis cursos
                </Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/registro">Registrarme</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
