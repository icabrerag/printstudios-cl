'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Box,
  LayoutDashboard,
  FileText,
  Package,
  Image as ImageIcon,
  MessageCircle,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react'

// Login Component
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
        toast.success('Bienvenido!')
      } else {
        toast.error(data.error || 'Error de autenticación')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Cube className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>PrintStudios Admin</CardTitle>
          <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@printstudios.cl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Credenciales por defecto: admin@printstudios.cl / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'services', label: 'Servicios', icon: Package },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'messages', label: 'Mensajes', icon: MessageCircle },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Cube className="h-8 w-8 text-primary" />
        <span className="font-bold text-lg">PrintStudios</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === item.id
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition mt-auto"
      >
        <LogOut className="h-5 w-5" />
        Cerrar Sesión
      </button>
    </div>
  )
}

// Dashboard Component
const Dashboard = ({ stats, recentQuotes }) => {
  const statCards = [
    { label: 'Total Cotizaciones', value: stats?.totalQuotes || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pendientes', value: stats?.pendingQuotes || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Aprobadas', value: stats?.approvedQuotes || 0, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Ingresos', value: `$${(stats?.totalRevenue || 0).toLocaleString('es-CL')}`, icon: DollarSign, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentQuotes?.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote.name}</p>
                      <p className="text-sm text-gray-500">{quote.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{quote.serviceId}</TableCell>
                  <TableCell>${(quote.estimatedPrice || 0).toLocaleString('es-CL')}</TableCell>
                  <TableCell>
                    <StatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell>{new Date(quote.createdAt).toLocaleDateString('es-CL')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { label: 'Pendiente', variant: 'secondary' },
    approved: { label: 'Aprobada', variant: 'default' },
    rejected: { label: 'Rechazada', variant: 'destructive' },
    in_progress: { label: 'En Proceso', variant: 'outline' },
    completed: { label: 'Completada', variant: 'default' }
  }

  const config = statusMap[status] || { label: status, variant: 'secondary' }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Quotes Management Component
const QuotesManagement = ({ quotes, onUpdateStatus, onRefresh }) => {
  const [selectedQuote, setSelectedQuote] = useState(null)

  const handleStatusChange = async (quoteId, newStatus) => {
    await onUpdateStatus(quoteId, { status: newStatus })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Cotizaciones</h1>
        <Button onClick={onRefresh} variant="outline">Actualizar</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Monto Est.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes?.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono text-xs">{quote.id?.slice(0, 8)}...</TableCell>
                  <TableCell>{quote.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{quote.email}</p>
                      <p className="text-gray-500">{quote.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{quote.serviceId?.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {quote.material && <p>Material: {quote.material}</p>}
                      {quote.size && <p>Tamaño: {quote.size}</p>}
                      {quote.quantity && <p>Cantidad: {quote.quantity}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${(quote.estimatedPrice || 0).toLocaleString('es-CL')}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={quote.status}
                      onValueChange={(value) => handleStatusChange(quote.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                        <SelectItem value="rejected">Rechazada</SelectItem>
                        <SelectItem value="in_progress">En Proceso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <p className="font-medium">{selectedQuote.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedQuote.email}</p>
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <p className="font-medium">{selectedQuote.phone || '-'}</p>
                </div>
                <div>
                  <Label>Fecha</Label>
                  <p className="font-medium">{new Date(selectedQuote.createdAt).toLocaleString('es-CL')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Material</Label>
                  <p className="font-medium">{selectedQuote.material || '-'}</p>
                </div>
                <div>
                  <Label>Tamaño</Label>
                  <p className="font-medium">{selectedQuote.size || '-'}</p>
                </div>
                <div>
                  <Label>Color</Label>
                  <p className="font-medium">{selectedQuote.color || '-'}</p>
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedQuote.notes || 'Sin notas'}</p>
              </div>
              <div>
                <Label>Archivo</Label>
                <p className="font-medium">{selectedQuote.fileName || 'No adjunto'}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label>Precio Estimado</Label>
                <p className="text-2xl font-bold text-primary">
                  ${(selectedQuote.estimatedPrice || 0).toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Services Management Component
const ServicesManagement = ({ services, onRefresh, token }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    category: '3d',
    image: '',
    features: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const serviceData = {
      ...formData,
      basePrice: parseInt(formData.basePrice),
      features: formData.features.split('\n').filter(f => f.trim())
    }

    try {
      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
      
      const response = await fetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
      })

      if (response.ok) {
        toast.success(editingService ? 'Servicio actualizado' : 'Servicio creado')
        setIsAddDialogOpen(false)
        setEditingService(null)
        setFormData({ title: '', description: '', basePrice: '', category: '3d', image: '', features: '' })
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al guardar servicio')
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Servicio eliminado')
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al eliminar servicio')
    }
  }

  const openEditDialog = (service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      basePrice: service.basePrice.toString(),
      category: service.category,
      image: service.image,
      features: service.features?.join('\n') || ''
    })
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Servicios</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Servicio
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <div className="h-40 overflow-hidden">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <Badge>{service.category === '3d' ? '3D' : 'Gráfica'}</Badge>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-primary mb-4">
                ${service.basePrice?.toLocaleString('es-CL')} CLP
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) {
          setEditingService(null)
          setFormData({ title: '', description: '', basePrice: '', category: '3d', image: '', features: '' })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio Base (CLP)</Label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3d">Impresión 3D</SelectItem>
                    <SelectItem value="grafica">Gráfica Publicitaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de Imagen</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Características (una por línea)</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Característica 1\nCaracterística 2\nCaracterística 3"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Portfolio Management Component
const PortfolioManagement = ({ portfolio, onRefresh, token }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Trabajo agregado al portfolio')
        setIsAddDialogOpen(false)
        setFormData({ title: '', category: '', image: '', description: '' })
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al agregar trabajo')
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('¿Eliminar este trabajo del portfolio?')) return

    try {
      const response = await fetch(`/api/admin/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Trabajo eliminado')
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Portfolio</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Trabajo
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio?.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar al Portfolio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Impresión 3D, Gráfica, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>URL de Imagen</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Agregar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Messages Component
const MessagesManagement = ({ messages, onRefresh, token }) => {
  const markAsRead = async (messageId) => {
    try {
      await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      onRefresh()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <Button onClick={onRefresh} variant="outline">Actualizar</Button>
      </div>

      <div className="space-y-4">
        {messages?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No hay mensajes
            </CardContent>
          </Card>
        )}
        {messages?.map((message) => (
          <Card key={message.id} className={message.read ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{message.name || message.email}</CardTitle>
                  <CardDescription>{message.email}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {!message.read && <Badge>Nuevo</Badge>}
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{message.message}</p>
              {!message.read && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => markAsRead(message.id)}
                >
                  Marcar como leído
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Main Admin Component
export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: null,
    recentQuotes: [],
    quotes: [],
    services: [],
    portfolio: [],
    messages: []
  })

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, activeTab])

  const fetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const dashData = await res.json()
          setData(prev => ({ ...prev, stats: dashData.stats, recentQuotes: dashData.recentQuotes }))
        }
      } else if (activeTab === 'quotes') {
        const res = await fetch('/api/admin/quotes', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const quotes = await res.json()
          setData(prev => ({ ...prev, quotes }))
        }
      } else if (activeTab === 'services') {
        const res = await fetch('/api/admin/services', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const services = await res.json()
          setData(prev => ({ ...prev, services }))
        }
      } else if (activeTab === 'portfolio') {
        const res = await fetch('/api/admin/portfolio', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const portfolio = await res.json()
          setData(prev => ({ ...prev, portfolio }))
        }
      } else if (activeTab === 'messages') {
        const res = await fetch('/api/admin/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const messages = await res.json()
          setData(prev => ({ ...prev, messages }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleUpdateQuoteStatus = async (quoteId, updates) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        toast.success('Estado actualizado')
        fetchData()
      }
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <Dashboard stats={data.stats} recentQuotes={data.recentQuotes} />
        )}
        {activeTab === 'quotes' && (
          <QuotesManagement
            quotes={data.quotes}
            onUpdateStatus={handleUpdateQuoteStatus}
            onRefresh={fetchData}
          />
        )}
        {activeTab === 'services' && (
          <ServicesManagement
            services={data.services}
            onRefresh={fetchData}
            token={localStorage.getItem('token')}
          />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioManagement
            portfolio={data.portfolio}
            onRefresh={fetchData}
            token={localStorage.getItem('token')}
          />
        )}
        {activeTab === 'messages' && (
          <MessagesManagement
            messages={data.messages}
            onRefresh={fetchData}
            token={localStorage.getItem('token')}
          />
        )}
      </main>
    </div>
  )
}
