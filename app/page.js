'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  Printer, 
  Cube, 
  Image as ImageIcon, 
  FileText, 
  Upload, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Menu, 
  X, 
  ChevronRight,
  Star,
  Clock,
  Shield,
  Zap,
  Check,
  ArrowRight,
  MessageCircle
} from 'lucide-react'

// Constants
const HERO_IMAGE = 'https://images.unsplash.com/photo-1627637819794-fba32f82be16?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHwxfHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85'
const PRINTER_IMAGE = 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85'
const DESIGN_IMAGE = 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85'
const WORKSPACE_IMAGE = 'https://images.unsplash.com/photo-1617695744007-68ef55752789?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85'

// Navbar Component
const Navbar = ({ onQuoteClick }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Cube className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">PrintStudios.cl</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#servicios" className="text-gray-600 hover:text-primary transition">Servicios</a>
            <a href="#portfolio" className="text-gray-600 hover:text-primary transition">Portfolio</a>
            <a href="#nosotros" className="text-gray-600 hover:text-primary transition">Nosotros</a>
            <a href="#contacto" className="text-gray-600 hover:text-primary transition">Contacto</a>
            <Button onClick={onQuoteClick}>Cotizar Ahora</Button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <a href="#servicios" className="block py-2 text-gray-600">Servicios</a>
            <a href="#portfolio" className="block py-2 text-gray-600">Portfolio</a>
            <a href="#nosotros" className="block py-2 text-gray-600">Nosotros</a>
            <a href="#contacto" className="block py-2 text-gray-600">Contacto</a>
            <Button className="w-full" onClick={onQuoteClick}>Cotizar Ahora</Button>
          </div>
        </div>
      )}
    </nav>
  )
}

// Hero Section
const HeroSection = ({ onQuoteClick }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    <div 
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `url(${HERO_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/70" />
    </div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
      <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">🇨🇱 Servicio en todo Chile</Badge>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Impresión 3D y Gráfica<br />Publicitaria Profesional
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
        Transformamos tus ideas en realidad. Desde prototipos 3D hasta material publicitario de alto impacto.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-white text-primary hover:bg-blue-50" onClick={onQuoteClick}>
          Solicitar Cotización <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
          Ver Portfolio
        </Button>
      </div>
      
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {[
          { icon: Zap, label: 'Entrega Rápida', value: '24-48h' },
          { icon: Shield, label: 'Garantía', value: '100%' },
          { icon: Star, label: 'Calificación', value: '4.9/5' },
          { icon: Clock, label: 'Soporte', value: '24/7' },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <item.icon className="h-8 w-8 mx-auto mb-2 text-blue-200" />
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-blue-200 text-sm">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

// Services Section
const ServicesSection = ({ services, onSelectService }) => (
  <section id="servicios" className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Badge className="mb-4">Nuestros Servicios</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Soluciones de Impresión Completas</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ofrecemos una amplia gama de servicios de impresión para satisfacer todas tus necesidades.
        </p>
      </div>

      <Tabs defaultValue="3d" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="3d">Impresión 3D</TabsTrigger>
          <TabsTrigger value="grafica">Gráfica Publicitaria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="3d" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.category === '3d').map((service) => (
              <ServiceCard key={service.id} service={service} onSelect={onSelectService} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="grafica" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.category === 'grafica').map((service) => (
              <ServiceCard key={service.id} service={service} onSelect={onSelectService} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </section>
)

// Service Card Component
const ServiceCard = ({ service, onSelect }) => (
  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
    <div className="h-48 overflow-hidden">
      <img 
        src={service.image} 
        alt={service.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{service.title}</CardTitle>
        <Badge variant="secondary">${service.basePrice.toLocaleString('es-CL')}</Badge>
      </div>
      <CardDescription>{service.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {service.features?.slice(0, 3).map((feature, i) => (
          <li key={i} className="flex items-center text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full" onClick={() => onSelect(service)}>
        Cotizar <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
)

// Portfolio Section
const PortfolioSection = ({ portfolio }) => (
  <section id="portfolio" className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Badge className="mb-4">Portfolio</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Trabajos Destacados</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Mira algunos de los proyectos que hemos realizado para nuestros clientes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="text-white">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-200">{item.category}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

// Quote Form Modal
const QuoteModal = ({ isOpen, onClose, selectedService, services }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: selectedService?.id || '',
    material: '',
    color: '',
    size: '',
    quantity: 1,
    notes: '',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({ ...prev, serviceId: selectedService.id }))
    }
  }, [selectedService])

  useEffect(() => {
    // Calculate estimated price
    const service = services.find(s => s.id === formData.serviceId)
    if (service) {
      let price = service.basePrice
      price *= formData.quantity || 1
      // Add material modifier
      if (formData.material === 'premium') price *= 1.5
      if (formData.material === 'especial') price *= 2
      // Add size modifier
      if (formData.size === 'grande') price *= 1.3
      if (formData.size === 'xl') price *= 1.8
      setEstimatedPrice(Math.round(price))
    }
  }, [formData, services])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'file') {
          submitData.append(key, formData[key])
        }
      })
      submitData.append('estimatedPrice', estimatedPrice)
      if (formData.file) {
        submitData.append('file', formData.file)
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedPrice,
          fileName: formData.file?.name || null
        })
      })

      if (response.ok) {
        toast.success('¡Cotización enviada!', {
          description: 'Te contactaremos pronto con los detalles.'
        })
        onClose()
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceId: '',
          material: '',
          color: '',
          size: '',
          quantity: 1,
          notes: '',
          file: null
        })
      } else {
        throw new Error('Error al enviar')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo enviar la cotización. Intenta nuevamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const currentService = services.find(s => s.id === formData.serviceId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Cotización</DialogTitle>
          <DialogDescription>
            Completa el formulario y te enviaremos una cotización personalizada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Servicio *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              >
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

          {currentService && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => setFormData({ ...formData, material: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estandar">Estándar</SelectItem>
                      <SelectItem value="premium">Premium (+50%)</SelectItem>
                      <SelectItem value="especial">Especial (+100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamaño</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData({ ...formData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeño</SelectItem>
                      <SelectItem value="mediano">Mediano</SelectItem>
                      <SelectItem value="grande">Grande (+30%)</SelectItem>
                      <SelectItem value="xl">Extra Grande (+80%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Personalizado'].map((color) => (
                    <Badge
                      key={color}
                      variant={formData.color === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, color })}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">Archivo (STL, PDF, PNG, JPG)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
              <input
                type="file"
                id="file"
                className="hidden"
                accept=".stl,.pdf,.png,.jpg,.jpeg,.ai,.eps"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                {formData.file ? (
                  <p className="text-sm text-primary font-medium">{formData.file.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">Arrastra tu archivo o haz clic para seleccionar</p>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe cualquier detalle adicional de tu proyecto..."
              rows={3}
            />
          </div>

          {estimatedPrice > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio estimado:</span>
                <span className="text-2xl font-bold text-primary">
                  ${estimatedPrice.toLocaleString('es-CL')} CLP
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">*Precio referencial, puede variar según especificaciones finales</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Cotización'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Contact Section
const ContactSection = () => (
  <section id="contacto" className="py-20 bg-gray-900 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <Badge className="mb-4 bg-primary">Contacto</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Tienes un proyecto en mente?</h2>
          <p className="text-gray-300 mb-8">
            Estamos listos para ayudarte a materializar tus ideas. Contáctanos y recibe asesoría personalizada.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Teléfono</p>
                <p className="font-medium">+56 9 1234 5678</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-medium">contacto@printstudios.cl</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ubicación</p>
                <p className="font-medium">Santiago, Chile</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
              <Facebook className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div>
          <img 
            src={WORKSPACE_IMAGE} 
            alt="Workspace"
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
)

// Footer
const Footer = () => (
  <footer className="bg-gray-950 text-gray-400 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Cube className="h-6 w-6 text-primary" />
          <span className="text-white font-bold">PrintStudios.cl</span>
        </div>
        <p className="text-sm">
          © 2025 PrintStudios.cl - Todos los derechos reservados
        </p>
      </div>
    </div>
  </footer>
)

// Main App Component
export default function App() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [services, setServices] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, portfolioRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/portfolio')
      ])
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }
      
      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json()
        setPortfolio(portfolioData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectService = (service) => {
    setSelectedService(service)
    setIsQuoteModalOpen(true)
  }

  const openQuoteModal = () => {
    setSelectedService(null)
    setIsQuoteModalOpen(true)
  }

  // Default services if API hasn't loaded yet
  const displayServices = services.length > 0 ? services : [
    {
      id: '1',
      title: 'Impresión 3D - Prototipos',
      description: 'Prototipado rápido para validar tus diseños',
      basePrice: 15000,
      category: '3d',
      image: PRINTER_IMAGE,
      features: ['Materiales PLA/ABS', 'Alta precisión', 'Entrega 48h']
    },
    {
      id: '2',
      title: 'Impresión 3D - Funcional',
      description: 'Piezas funcionales y duraderas',
      basePrice: 25000,
      category: '3d',
      image: PRINTER_IMAGE,
      features: ['PETG/Nylon disponible', 'Resistencia mecánica', 'Certificado calidad']
    },
    {
      id: '3',
      title: 'Figuras y Modelos',
      description: 'Figuras decorativas y coleccionables',
      basePrice: 20000,
      category: '3d',
      image: PRINTER_IMAGE,
      features: ['Alta resolución', 'Pintado opcional', 'Packaging especial']
    },
    {
      id: '4',
      title: 'Roll-ups y Banners',
      description: 'Publicidad portátil de alto impacto',
      basePrice: 35000,
      category: 'grafica',
      image: DESIGN_IMAGE,
      features: ['Incluye estructura', 'Lona premium', 'Bolso de transporte']
    },
    {
      id: '5',
      title: 'Volantes y Flyers',
      description: 'Material promocional impreso',
      basePrice: 15000,
      category: 'grafica',
      image: DESIGN_IMAGE,
      features: ['Desde 100 unidades', 'Papel couché', 'Diseño incluido']
    },
    {
      id: '6',
      title: 'Tarjetas de Presentación',
      description: 'Tarjetas profesionales de calidad',
      basePrice: 12000,
      category: 'grafica',
      image: DESIGN_IMAGE,
      features: ['500 unidades', 'Laminado mate/brillo', 'Diseño personalizado']
    }
  ]

  const displayPortfolio = portfolio.length > 0 ? portfolio : [
    { id: '1', title: 'Prototipo Industrial', category: 'Impresión 3D', image: PRINTER_IMAGE },
    { id: '2', title: 'Stand Publicitario', category: 'Gráfica', image: DESIGN_IMAGE },
    { id: '3', title: 'Figura Coleccionable', category: 'Impresión 3D', image: PRINTER_IMAGE },
    { id: '4', title: 'Campaña Marketing', category: 'Gráfica', image: WORKSPACE_IMAGE },
    { id: '5', title: 'Repuesto Automotriz', category: 'Impresión 3D', image: PRINTER_IMAGE },
    { id: '6', title: 'Material Evento', category: 'Gráfica', image: DESIGN_IMAGE }
  ]

  return (
    <div className="min-h-screen">
      <Navbar onQuoteClick={openQuoteModal} />
      <HeroSection onQuoteClick={openQuoteModal} />
      <ServicesSection services={displayServices} onSelectService={handleSelectService} />
      <PortfolioSection portfolio={displayPortfolio} />
      <ContactSection />
      <Footer />
      
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedService={selectedService}
        services={displayServices}
      />

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/56912345678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  )
}
