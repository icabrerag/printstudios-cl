import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'PrintStudios.cl - Impresion 3D y grafica publicitaria',
  description: 'Servicios profesionales de impresion 3D, prototipado y grafica publicitaria en Chile.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
