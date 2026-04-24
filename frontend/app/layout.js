import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'PrintStudios.cl - Impresión 3D y Gráfica Publicitaria',
  description: 'Servicios profesionales de impresión 3D y gráfica publicitaria en Chile. Rollups, banners, volantes y más.',
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
