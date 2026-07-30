'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Clock, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, Send, Shield, Star, Upload, X, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Chatbot from '@/components/Chatbot'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { HERO_IMAGE, WORKSHOP_IMAGE } from '@/lib/landingData'

const money = (value) => `$${Number(value || 0).toLocaleString('es-CL')} CLP`
const BRAND_WORDMARK_DARK = '/assets/brand/printstudios-wordmark-dark-transparent.png'
const BRAND_WORDMARK_LIGHT = '/assets/brand/printstudios-wordmark-light-crop.png'
const BRAND_LOGO_FULL = '/assets/brand/printstudios-logo-full.png'
const PROJECT_REEL = '/assets/videos/printstudios-project-reel.mp4'

function Navbar({ onQuoteClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const links = [
    ['#servicios', 'Servicios'],
    ['#portfolio', 'Trabajos'],
    ['#proceso', 'Proceso'],
    ['/cursos', 'Cursos'],
    ['#contacto', 'Contacto'],
  ]

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#c5a06d]/20 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <img src={BRAND_WORDMARK_DARK} alt="PrintStudios" className="h-10 w-auto sm:h-12 lg:h-14" />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium text-[#2b3940] transition hover:text-[#b9935e]">
              {label}
            </a>
          ))}
          <Button className="bg-[#2b3940] text-white hover:bg-[#1f2a30]" onClick={onQuoteClick}>Cotizar ahora</Button>
        </div>
        <button className="rounded-md p-2 text-[#2b3940] md:hidden" onClick={() => setIsOpen((value) => !value)} aria-label="Abrir menu">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-[#c5a06d]/20 bg-white px-4 py-3 md:hidden">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="block py-2 text-[#2b3940]" onClick={() => setIsOpen(false)}>
              {label}
            </a>
          ))}
          <Button className="mt-2 w-full bg-[#2b3940] text-white hover:bg-[#1f2a30]" onClick={onQuoteClick}>
            Cotizar ahora
          </Button>
        </div>
      )}
    </nav>
  )
}

function HeroSection({ onQuoteClick }) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#1f2a30] pt-20">
      <video className="absolute inset-0 h-full w-full object-cover opacity-70" src={PROJECT_REEL} autoPlay muted loop playsInline poster={HERO_IMAGE} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1f2a30]/95 via-[#2b3940]/82 to-[#c5a06d]/58" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 text-white sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="max-w-3xl">
          <img src={BRAND_WORDMARK_LIGHT} alt="PrintStudios" className="mb-8 w-[min(92vw,820px)] max-w-full" />
          <Badge className="mb-5 bg-[#c5a06d] text-[#1f2a30] hover:bg-[#d3b27f]">Impresion 3D, modelado y piezas a medida</Badge>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">Fabricamos soluciones reales desde una idea, pieza o referencia.</h1>
          <p className="mt-5 text-xl leading-relaxed text-[#f6eadb] md:text-2xl">
            Prototipos, repuestos, componentes automotrices y productos personalizados con asesoria tecnica desde el diseño hasta la impresion.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="bg-[#c5a06d] text-[#1f2a30] hover:bg-[#d3b27f]" onClick={onQuoteClick}>
              Solicitar cotizacion <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white bg-white/5 text-white hover:bg-white/10" asChild>
              <a href="#portfolio">Ver trabajos</a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 self-end rounded-lg border border-[#c5a06d]/35 bg-[#1f2a30]/55 p-4 backdrop-blur">
          {[
            [Zap, 'Cotizacion agil', '24-48h'],
            [Shield, 'Asesoria tecnica', 'Incluida'],
            [Star, 'Piezas a medida', 'Custom'],
            [Clock, 'Produccion flexible', 'Por encargo'],
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-md bg-white/10 p-4">
              <Icon className="mb-3 h-6 w-6 text-[#d3b27f]" />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-sm text-[#f6eadb]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service, onSelect }) {
  return (
    <Card className="overflow-hidden border-[#d8c2a3] transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img src={service.image} alt={service.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{service.title}</CardTitle>
          <Badge variant="secondary">{money(service.basePrice)}</Badge>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {service.features?.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-[#b9935e]" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#2b3940] text-white hover:bg-[#1f2a30]" onClick={() => onSelect(service)}>
          Cotizar servicio
        </Button>
      </CardFooter>
    </Card>
  )
}

function BrandProofSection() {
  return (
    <section className="bg-[#f7f3ed] py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Badge className="mb-4 bg-[#c5a06d] text-[#1f2a30]">Proyectos PrintStudios</Badge>
          <h2 className="text-3xl font-bold text-[#1f2a30] md:text-4xl">Piezas funcionales, detalles automotrices y prototipos listos para validar.</h2>
          <p className="mt-4 text-lg leading-relaxed text-[#4a565b]">
            El reel de proyectos muestra piezas de prueba, prototipos y repuestos que se pueden fabricar con impresoras 3D, CNC y corte laser.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-[#c5a06d]/40 bg-[#1f2a30] shadow-xl">
          <video className="aspect-video h-full w-full object-cover" src={PROJECT_REEL} autoPlay muted loop playsInline controls />
        </div>
      </div>
    </section>
  )
}

function ServicesSection({ services, onSelectService }) {
  return (
    <section id="servicios" className="bg-[#faf8f4] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-[#2b3940] text-white">Servicios</Badge>
          <h2 className="text-3xl font-bold text-[#1f2a30] md:text-4xl">Soluciones para imprimir, probar y vender mejor</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#4a565b]">
            Desde piezas funcionales, prototipos y repuestos hasta productos personalizados, ofrecemos servicios de impresion 3D, modelado y asesoría técnica para llevar tus ideas a la realidad.
          </p>
        </div>
        <Tabs defaultValue="3d" className="w-full">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="3d">Impresion 3D</TabsTrigger>
            <TabsTrigger value="grafica">Grafica</TabsTrigger>
          </TabsList>
          {['3d', 'grafica'].map((category) => (
            <TabsContent key={category} value={category}>
              {services.filter((service) => service.category === category).length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {services.filter((service) => service.category === category).map((service) => (
                    <ServiceCard key={service.id} service={service} onSelect={onSelectService} />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed bg-white p-8 text-center text-gray-500">
                  No hay servicios publicados en esta categoria.
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

function PortfolioSection({ portfolio }) {
  return (
    <section id="portfolio" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-[#c5a06d] text-[#1f2a30]">Trabajos</Badge>
          <h2 className="text-3xl font-bold text-[#1f2a30] md:text-4xl">Muestras preparadas para reemplazar por proyectos reales</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#4a565b]">
            El portfolio muestra piezas de prueba, prototipos y repuestos que se pueden fabricar con impresoras 3D, CNC y corte laser. Cada pieza es un ejemplo de lo que podemos lograr juntos.
          </p>
        </div>
        {portfolio.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {portfolio.map((item) => (
              <Card key={item.id} className="overflow-hidden border-[#d8c2a3]">
                <div className="h-64 overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed bg-white p-8 text-center text-gray-500">
            No hay trabajos publicados todavia.
          </p>
        )}
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section id="proceso" className="bg-[#1f2a30] py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Badge className="mb-4 bg-[#c5a06d] text-[#1f2a30]">Proceso</Badge>
          <h2 className="text-3xl font-bold md:text-4xl">Del archivo a la pieza lista</h2>
          <p className="mt-4 text-[#f6eadb]">
            Un flujo simple para una pyme: recibir referencia, revisar factibilidad, cotizar, producir y entregar.
          </p>
          <div className="mt-8 space-y-5">
            {['Envias archivo, foto o idea', 'Revisamos material, medidas y acabado', 'Confirmas cotizacion y plazo', 'Producimos y coordinamos entrega'].map((step, index) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c5a06d] font-bold text-[#1f2a30]">{index + 1}</div>
                <p className="pt-1 text-slate-100">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <img src={WORKSHOP_IMAGE} alt="Proceso de impresion 3D" className="h-full max-h-[520px] w-full rounded-lg object-cover shadow-2xl" />
      </div>
    </section>
  )
}

function ContactSection({ onQuoteClick }) {
  return (
    <section id="contacto" className="bg-[#f7f3ed] py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Badge className="mb-4 bg-[#2b3940] text-white">Contacto</Badge>
          <h2 className="text-3xl font-bold text-[#1f2a30] md:text-4xl">Hablemos de tu proxima pieza</h2>
          <p className="mt-4 text-[#4a565b]">
            La web queda preparada para conectar formulario, chatbot, WhatsApp, Shopify o carrito propio segun el siguiente hito.
          </p>
          <div className="mt-8 space-y-4">
            <ContactRow icon={Phone} label="Telefono / WhatsApp" value="+56 9 1234 5678" />
            <ContactRow icon={Mail} label="Email" value="contacto@printstudios.cl" />
            <ContactRow icon={MapPin} label="Ubicacion" value="Concon, Chile" />
            <ContactRow icon={Instagram} label="Instagram" value="@printstudios.cl" />
          </div>
        </div>
        <Card className="border-[#d8c2a3]">
          <CardHeader>
            <CardTitle>Canales recomendados</CardTitle>
            <CardDescription>Para esta etapa, WhatsApp e Instagram deben ser llamados a la accion principales.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-[#2b3940] text-white hover:bg-[#1f2a30]" onClick={onQuoteClick}>
              <Send className="mr-2 h-4 w-4" />
              Solicitar cotizacion
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <a href="https://www.instagram.com/printstudios.cl/" target="_blank" rel="noreferrer">
                <Instagram className="mr-2 h-4 w-4" />
                Ver Instagram
              </a>
            </Button>
            <Button className="w-full" variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp pendiente de numero real
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-full bg-[#c5a06d]/20 p-3 text-[#2b3940]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function QuoteModal({ isOpen, onClose, selectedService, services }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    material: '',
    size: '',
    quantity: 1,
    notes: '',
    file: null,
  })

  useEffect(() => {
    if (selectedService) setFormData((current) => ({ ...current, serviceId: selectedService.id }))
  }, [selectedService])

  const selected = services.find((service) => service.id === formData.serviceId)
  const estimatedPrice = useMemo(() => {
    if (!selected) return 0
    let price = selected.basePrice * (Number(formData.quantity) || 1)
    if (formData.material === 'premium') price *= 1.5
    if (formData.size === 'grande') price *= 1.3
    return Math.round(price)
  }, [formData.material, formData.quantity, formData.size, selected])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedPrice,
          fileName: formData.file?.name || null,
        }),
      })
      if (!response.ok) throw new Error('No se pudo enviar')
      toast.success('Cotizacion enviada', { description: 'Te contactaremos con los detalles.' })
      onClose()
      setFormData({ name: '', email: '', phone: '', serviceId: '', material: '', size: '', quantity: 1, notes: '', file: null })
    } catch (error) {
      toast.error('No se pudo enviar la cotizacion', { description: 'Revisa el backend o intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar cotizacion</DialogTitle>
          <DialogDescription>Completa los datos base. El precio mostrado es solo referencial.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre completo" id="name" required value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
            <Field label="Email" id="email" type="email" required value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} />
            <Field label="Telefono" id="phone" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estandar">Estandar</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamano</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeno">Pequeno</SelectItem>
                  <SelectItem value="mediano">Mediano</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Cantidad" id="quantity" type="number" min="1" value={formData.quantity} onChange={(value) => setFormData({ ...formData, quantity: value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Archivo o referencia</Label>
            <label className="block cursor-pointer rounded-lg border-2 border-dashed border-[#d8c2a3] p-6 text-center transition hover:border-[#c5a06d]" htmlFor="file">
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">{formData.file ? formData.file.name : 'STL, OBJ, STEP, PDF o imagen de referencia'}</span>
            </label>
            <input id="file" type="file" className="hidden" accept=".stl,.obj,.3mf,.step,.stp,.pdf,.png,.jpg,.jpeg" onChange={(event) => setFormData({ ...formData, file: event.target.files?.[0] || null })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={3} value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} placeholder="Medidas, uso, color, fecha requerida o referencia del proyecto." />
          </div>
          {estimatedPrice > 0 && (
            <div className="rounded-lg bg-[#f7f3ed] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">Precio referencial</span>
                <strong className="text-xl text-[#2b3940]">{money(estimatedPrice)}</strong>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar cotizacion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, id, onChange, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-[#1f2a30] py-8 text-[#d8c2a3]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="flex items-center gap-2">
          <img src={BRAND_WORDMARK_LIGHT} alt="PrintStudios" className="h-10 w-auto sm:h-12" />
        </div>
        <p className="text-sm">© 2026 PrintStudios.cl. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default function HomePage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [services, setServices] = useState([])
  const [portfolio, setPortfolio] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, portfolioRes] = await Promise.all([fetch('/api/services'), fetch('/api/portfolio')])
        if (servicesRes.ok) setServices(await servicesRes.json())
        if (portfolioRes.ok) setPortfolio(await portfolioRes.json())
      } catch (error) {
        console.info('Usando datos locales de landing.')
      }
    }
    loadData()
  }, [])

  const openQuoteModal = (service = null) => {
    setSelectedService(service)
    setIsQuoteModalOpen(true)
  }

  return (
    <main className="min-h-screen">
      <Navbar onQuoteClick={() => openQuoteModal()} />
      <HeroSection onQuoteClick={() => openQuoteModal()} />
      <BrandProofSection />
      <ServicesSection services={services} onSelectService={openQuoteModal} />
      <PortfolioSection portfolio={portfolio} />
      <ProcessSection />
      <ContactSection onQuoteClick={() => openQuoteModal()} />
      <Footer />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} selectedService={selectedService} services={services} />
      <Chatbot />
    </main>
  )
}
