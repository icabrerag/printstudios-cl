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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Users,
  Bot,
  Send,
  AlertTriangle,
  ArrowRight,
  Paperclip
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
            <Box className="h-12 w-12 text-primary" />
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
const Sidebar = ({ activeTab, setActiveTab, onLogout, botRequestCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bot-requests', label: 'Solicitudes Bot', icon: Bot, badge: botRequestCount },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'services', label: 'Servicios', icon: Package },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'messages', label: 'Mensajes', icon: MessageCircle },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Box className="h-8 w-8 text-primary" />
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
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge > 0 && (
              <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
            )}
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
    completed: { label: 'Completada', variant: 'default' },
    NEW: { label: 'Nueva', variant: 'default' },
    WAITING_INFO: { label: 'Esperando Info', variant: 'secondary' },
    QUOTED: { label: 'Cotizada', variant: 'default' },
    IN_PRODUCTION: { label: 'En Producción', variant: 'outline' },
    READY: { label: 'Lista', variant: 'default' },
    DELIVERED: { label: 'Entregada', variant: 'default' }
  }

  const config = statusMap[status] || { label: status, variant: 'secondary' }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Bot Request Status Badge
const BotStatusBadge = ({ status }) => {
  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    WAITING_INFO: 'bg-yellow-100 text-yellow-800',
    QUOTED: 'bg-green-100 text-green-800',
    IN_PRODUCTION: 'bg-purple-100 text-purple-800',
    READY: 'bg-teal-100 text-teal-800',
    DELIVERED: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

// Bot Requests Management Component
const BotRequestsManagement = ({ requests, onRefresh, token }) => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [conversation, setConversation] = useState([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isConvertOpen, setIsConvertOpen] = useState(false)
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false)
  const [convertData, setConvertData] = useState({ estimatedPrice: '', estimatedDays: '', notes: '' })
  const [requestInfoMessage, setRequestInfoMessage] = useState('')

  const viewDetail = async (request) => {
    setSelectedRequest(request)
    try {
      const response = await fetch(`/api/admin/bot-requests/${request.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation || [])
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
    setIsDetailOpen(true)
  }

  const handleConvert = async () => {
    try {
      const response = await fetch(`/api/admin/bot-requests/${selectedRequest.id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(convertData)
      })

      if (response.ok) {
        toast.success('Solicitud convertida a cotización')
        setIsConvertOpen(false)
        setConvertData({ estimatedPrice: '', estimatedDays: '', notes: '' })
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al convertir')
    }
  }

  const handleRequestInfo = async () => {
    try {
      const response = await fetch(`/api/admin/bot-requests/${selectedRequest.id}/request-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: requestInfoMessage })
      })

      if (response.ok) {
        toast.success('Solicitud de información enviada')
        setIsRequestInfoOpen(false)
        setRequestInfoMessage('')
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al enviar solicitud')
    }
  }

  const updateStatus = async (requestId, status) => {
    try {
      const response = await fetch(`/api/admin/bot-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('Estado actualizado')
        onRefresh()
      }
    } catch (error) {
      toast.error('Error al actualizar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Solicitudes del Chatbot</h1>
          <p className="text-gray-500 text-sm">Solicitudes de cotización generadas por el asistente de IA</p>
        </div>
        <Button onClick={onRefresh} variant="outline">Actualizar</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {requests?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay solicitudes del chatbot aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Archivos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString('es-CL')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.contact?.name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{req.contact?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.intentType || 'General'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {req.requirements?.description || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      {(req.attachments?.length || 0) > 0 ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Paperclip className="w-3 h-3 mr-1" />
                          {req.attachments.length}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <BotStatusBadge status={req.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => viewDetail(req)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud</DialogTitle>
            <DialogDescription>
              Solicitud #{selectedRequest?.id?.slice(0, 8)}... - {selectedRequest?.contact?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="conversation">Conversación</TabsTrigger>
                <TabsTrigger value="summary">Resumen</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p><strong>Nombre:</strong> {selectedRequest?.contact?.name}</p>
                      <p><strong>Email:</strong> {selectedRequest?.contact?.email}</p>
                      <p><strong>WhatsApp:</strong> {selectedRequest?.contact?.whatsapp || '-'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p><strong>Tipo:</strong> {selectedRequest?.intentType}</p>
                      <p><strong>Descripción:</strong> {selectedRequest?.requirements?.description}</p>
                      <p><strong>Uso:</strong> {selectedRequest?.requirements?.usage}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Especificaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p><strong>Material:</strong> {selectedRequest?.requirements?.material || '-'}</p>
                      <p><strong>Color:</strong> {selectedRequest?.requirements?.color || '-'}</p>
                      <p><strong>Cantidad:</strong> {selectedRequest?.requirements?.quantity || 1}</p>
                      <p><strong>Dimensiones:</strong> {selectedRequest?.requirements?.dimensions || '-'}</p>
                      <p><strong>Acabado:</strong> {selectedRequest?.requirements?.finish || '-'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p><strong>Urgencia:</strong> {selectedRequest?.requirements?.deadline || '-'}</p>
                      <p><strong>Entrega:</strong> {selectedRequest?.requirements?.delivery || '-'}</p>
                      <p><strong>Presupuesto:</strong> {selectedRequest?.requirements?.budget || 'Abierto'}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedRequest?.attachments?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Archivos Adjuntos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.attachments.map((file, i) => (
                          <Badge key={i} variant="outline" className="py-1">
                            <Paperclip className="w-3 h-3 mr-1" />
                            {file.type} #{i + 1}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="conversation" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[400px] pr-4">
                      {conversation.map((msg, i) => (
                        <div
                          key={i}
                          className={`mb-3 flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              msg.role === 'bot'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-primary text-white'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-xs opacity-60 mt-1 block">
                              {new Date(msg.timestamp).toLocaleTimeString('es-CL')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    {selectedRequest?.summary?.bullets?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Puntos Clave</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {selectedRequest.summary.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRequest?.summary?.risks?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Riesgos / Alertas
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                          {selectedRequest.summary.risks.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRequest?.summary?.questions?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">Preguntas Pendientes</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                          {selectedRequest.summary.questions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedRequest?.missingInfo?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Información Faltante</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {selectedRequest.missingInfo.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Select
              value={selectedRequest?.status}
              onValueChange={(value) => {
                updateStatus(selectedRequest?.id, value)
                setSelectedRequest(prev => ({ ...prev, status: value }))
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">Nueva</SelectItem>
                <SelectItem value="WAITING_INFO">Esperando Info</SelectItem>
                <SelectItem value="QUOTED">Cotizada</SelectItem>
                <SelectItem value="IN_PRODUCTION">En Producción</SelectItem>
                <SelectItem value="READY">Lista</SelectItem>
                <SelectItem value="DELIVERED">Entregada</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setIsDetailOpen(false)
                setIsRequestInfoOpen(true)
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Solicitar Info
            </Button>

            <Button
              onClick={() => {
                setIsDetailOpen(false)
                setIsConvertOpen(true)
              }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Convertir a Cotización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Quote Dialog */}
      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convertir a Cotización</DialogTitle>
            <DialogDescription>
              Genera una cotización formal para {selectedRequest?.contact?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Precio Estimado (CLP)</Label>
              <Input
                type="number"
                placeholder="25000"
                value={convertData.estimatedPrice}
                onChange={(e) => setConvertData({ ...convertData, estimatedPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Días de Entrega Estimados</Label>
              <Input
                type="number"
                placeholder="7"
                value={convertData.estimatedDays}
                onChange={(e) => setConvertData({ ...convertData, estimatedDays: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notas para el Cliente</Label>
              <Textarea
                placeholder="Detalles adicionales de la cotización..."
                value={convertData.notes}
                onChange={(e) => setConvertData({ ...convertData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConvert}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Cotización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request More Info Dialog */}
      <Dialog open={isRequestInfoOpen} onOpenChange={setIsRequestInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Más Información</DialogTitle>
            <DialogDescription>
              Envía un mensaje a {selectedRequest?.contact?.name} pidiendo más detalles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                placeholder="¿Podrías enviarnos más detalles sobre...?"
                value={requestInfoMessage}
                onChange={(e) => setRequestInfoMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestInfoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestInfo}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
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
    messages: [],
    botRequests: []
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
