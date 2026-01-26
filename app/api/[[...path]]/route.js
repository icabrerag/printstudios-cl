import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// MongoDB connection
let client
let db

const JWT_SECRET = process.env.JWT_SECRET || 'printstudios-secret-key-2025'

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'printstudios')
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Auth middleware
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Default services data
const defaultServices = [
  {
    id: uuidv4(),
    title: 'Impresión 3D - Prototipos',
    description: 'Prototipado rápido para validar tus diseños. Ideal para startups y desarrollo de productos.',
    basePrice: 15000,
    category: '3d',
    image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85',
    features: ['Materiales PLA/ABS', 'Alta precisión 0.1mm', 'Entrega en 48h', 'Asesoría técnica'],
    active: true
  },
  {
    id: uuidv4(),
    title: 'Impresión 3D - Funcional',
    description: 'Piezas funcionales y duraderas para uso industrial o comercial.',
    basePrice: 25000,
    category: '3d',
    image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85',
    features: ['PETG/Nylon/TPU disponible', 'Resistencia mecánica', 'Certificado de calidad', 'Post-procesado incluido'],
    active: true
  },
  {
    id: uuidv4(),
    title: 'Figuras y Modelos 3D',
    description: 'Figuras decorativas, coleccionables y modelos arquitectónicos.',
    basePrice: 20000,
    category: '3d',
    image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85',
    features: ['Alta resolución', 'Pintado opcional', 'Packaging especial', 'Escala personalizada'],
    active: true
  },
  {
    id: uuidv4(),
    title: 'Roll-ups y Banners',
    description: 'Publicidad portátil de alto impacto para eventos y puntos de venta.',
    basePrice: 35000,
    category: 'grafica',
    image: 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85',
    features: ['Incluye estructura metálica', 'Lona premium 440g', 'Bolso de transporte', 'Diseño incluido'],
    active: true
  },
  {
    id: uuidv4(),
    title: 'Volantes y Flyers',
    description: 'Material promocional impreso de alta calidad para campañas.',
    basePrice: 15000,
    category: 'grafica',
    image: 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85',
    features: ['Desde 100 unidades', 'Papel couché 300g', 'Full color ambas caras', 'Troquelado opcional'],
    active: true
  },
  {
    id: uuidv4(),
    title: 'Tarjetas de Presentación',
    description: 'Tarjetas profesionales que causan impresión duradera.',
    basePrice: 12000,
    category: 'grafica',
    image: 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85',
    features: ['500 unidades', 'Laminado mate o brillo', 'Diseño personalizado', 'Entrega rápida'],
    active: true
  }
]

// Default portfolio data
const defaultPortfolio = [
  { id: uuidv4(), title: 'Prototipo Industrial', category: 'Impresión 3D', image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85', description: 'Prototipo de pieza industrial para cliente automotriz' },
  { id: uuidv4(), title: 'Stand Publicitario', category: 'Gráfica', image: 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85', description: 'Stand completo para feria tecnológica' },
  { id: uuidv4(), title: 'Figura Coleccionable', category: 'Impresión 3D', image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85', description: 'Figura personalizada para coleccionista' },
  { id: uuidv4(), title: 'Campaña Marketing', category: 'Gráfica', image: 'https://images.unsplash.com/photo-1617695744007-68ef55752789?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85', description: 'Material completo para campaña de lanzamiento' },
  { id: uuidv4(), title: 'Repuesto Mecánico', category: 'Impresión 3D', image: 'https://images.unsplash.com/photo-1612886653463-311e7497e688?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTN8MHwxfHNlYXJjaHw0fHwzRCUyMHByaW50aW5nfGVufDB8fHxibHVlfDE3Njk0NTYxODd8MA&ixlib=rb-4.1.0&q=85', description: 'Pieza de repuesto para maquinaria industrial' },
  { id: uuidv4(), title: 'Material Evento', category: 'Gráfica', image: 'https://images.unsplash.com/photo-1588829608152-e7accc3c7eef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxwcmludGluZ3xlbnwwfHx8Ymx1ZXwxNzY5NDU2MjAzfDA&ixlib=rb-4.1.0&q=85', description: 'Brandeo completo para evento corporativo' }
]

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // ==================== PUBLIC ROUTES ====================

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'PrintStudios API v1.0' }))
    }

    // GET /api/services - Get all active services (public)
    if (route === '/services' && method === 'GET') {
      let services = await db.collection('services').find({ active: true }).toArray()
      
      // If no services, seed with defaults
      if (services.length === 0) {
        await db.collection('services').insertMany(defaultServices)
        services = defaultServices
      }
      
      const cleanedServices = services.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedServices))
    }

    // GET /api/portfolio - Get portfolio items (public)
    if (route === '/portfolio' && method === 'GET') {
      let portfolio = await db.collection('portfolio').find({}).toArray()
      
      // If no portfolio, seed with defaults
      if (portfolio.length === 0) {
        await db.collection('portfolio').insertMany(defaultPortfolio)
        portfolio = defaultPortfolio
      }
      
      const cleanedPortfolio = portfolio.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedPortfolio))
    }

    // POST /api/quotes - Create a quote request (public)
    if (route === '/quotes' && method === 'POST') {
      const body = await request.json()
      
      if (!body.name || !body.email || !body.serviceId) {
        return handleCORS(NextResponse.json(
          { error: 'Nombre, email y servicio son requeridos' },
          { status: 400 }
        ))
      }

      const quote = {
        id: uuidv4(),
        ...body,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('quotes').insertOne(quote)
      
      // Here we would send email notification (MOCKED)
      console.log(`[EMAIL MOCKED] Nueva cotización de ${body.name} - ${body.email}`)
      
      return handleCORS(NextResponse.json({ 
        success: true, 
        message: 'Cotización recibida exitosamente',
        quoteId: quote.id 
      }))
    }

    // GET /api/quotes/track/:id - Track quote status (public)
    if (route.startsWith('/quotes/track/') && method === 'GET') {
      const quoteId = path[2]
      const quote = await db.collection('quotes').findOne({ id: quoteId })
      
      if (!quote) {
        return handleCORS(NextResponse.json(
          { error: 'Cotización no encontrada' },
          { status: 404 }
        ))
      }
      
      const { _id, ...cleanQuote } = quote
      return handleCORS(NextResponse.json(cleanQuote))
    }

    // ==================== AUTH ROUTES ====================

    // POST /api/auth/login - Admin login
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      
      if (!body.email || !body.password) {
        return handleCORS(NextResponse.json(
          { error: 'Email y contraseña son requeridos' },
          { status: 400 }
        ))
      }

      // Check for admin user
      let admin = await db.collection('admins').findOne({ email: body.email })
      
      // Create default admin if none exists
      if (!admin && body.email === 'admin@printstudios.cl') {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        admin = {
          id: uuidv4(),
          email: 'admin@printstudios.cl',
          password: hashedPassword,
          name: 'Administrador',
          role: 'admin',
          createdAt: new Date()
        }
        await db.collection('admins').insertOne(admin)
      }

      if (!admin) {
        return handleCORS(NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        ))
      }

      const validPassword = await bcrypt.compare(body.password, admin.password)
      if (!validPassword) {
        return handleCORS(NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        ))
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      return handleCORS(NextResponse.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      }))
    }

    // GET /api/auth/me - Get current user
    if (route === '/auth/me' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        ))
      }
      return handleCORS(NextResponse.json(user))
    }

    // ==================== ADMIN ROUTES ====================

    // GET /api/admin/dashboard - Dashboard stats
    if (route === '/admin/dashboard' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const totalQuotes = await db.collection('quotes').countDocuments()
      const pendingQuotes = await db.collection('quotes').countDocuments({ status: 'pending' })
      const approvedQuotes = await db.collection('quotes').countDocuments({ status: 'approved' })
      const completedOrders = await db.collection('quotes').countDocuments({ status: 'completed' })
      
      // Calculate revenue from completed orders
      const completedOrdersData = await db.collection('quotes').find({ status: 'completed' }).toArray()
      const totalRevenue = completedOrdersData.reduce((sum, order) => sum + (order.estimatedPrice || 0), 0)
      
      // Recent quotes
      const recentQuotes = await db.collection('quotes')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()

      return handleCORS(NextResponse.json({
        stats: {
          totalQuotes,
          pendingQuotes,
          approvedQuotes,
          completedOrders,
          totalRevenue
        },
        recentQuotes: recentQuotes.map(({ _id, ...rest }) => rest)
      }))
    }

    // GET /api/admin/quotes - Get all quotes (admin)
    if (route === '/admin/quotes' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const quotes = await db.collection('quotes')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedQuotes = quotes.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedQuotes))
    }

    // PUT /api/admin/quotes/:id - Update quote status
    if (route.startsWith('/admin/quotes/') && method === 'PUT') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const quoteId = path[2]
      const body = await request.json()

      const result = await db.collection('quotes').updateOne(
        { id: quoteId },
        { 
          $set: { 
            ...body,
            updatedAt: new Date() 
          } 
        }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Cotización no encontrada' },
          { status: 404 }
        ))
      }

      // Mocked email notification
      console.log(`[EMAIL MOCKED] Estado actualizado para cotización ${quoteId}: ${body.status}`)

      return handleCORS(NextResponse.json({ success: true, message: 'Cotización actualizada' }))
    }

    // GET /api/admin/services - Get all services (admin)
    if (route === '/admin/services' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      let services = await db.collection('services').find({}).toArray()
      if (services.length === 0) {
        await db.collection('services').insertMany(defaultServices)
        services = defaultServices
      }
      
      const cleanedServices = services.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedServices))
    }

    // POST /api/admin/services - Create service
    if (route === '/admin/services' && method === 'POST') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const body = await request.json()
      const service = {
        id: uuidv4(),
        ...body,
        active: true,
        createdAt: new Date()
      }

      await db.collection('services').insertOne(service)
      return handleCORS(NextResponse.json({ success: true, service }))
    }

    // PUT /api/admin/services/:id - Update service
    if (route.startsWith('/admin/services/') && method === 'PUT') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const serviceId = path[2]
      const body = await request.json()

      const result = await db.collection('services').updateOne(
        { id: serviceId },
        { $set: { ...body, updatedAt: new Date() } }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Servicio no encontrado' },
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ success: true }))
    }

    // DELETE /api/admin/services/:id - Delete service
    if (route.startsWith('/admin/services/') && method === 'DELETE') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const serviceId = path[2]
      await db.collection('services').deleteOne({ id: serviceId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // GET /api/admin/portfolio - Get all portfolio (admin)
    if (route === '/admin/portfolio' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      let portfolio = await db.collection('portfolio').find({}).toArray()
      if (portfolio.length === 0) {
        await db.collection('portfolio').insertMany(defaultPortfolio)
        portfolio = defaultPortfolio
      }
      
      const cleanedPortfolio = portfolio.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedPortfolio))
    }

    // POST /api/admin/portfolio - Create portfolio item
    if (route === '/admin/portfolio' && method === 'POST') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const body = await request.json()
      const item = {
        id: uuidv4(),
        ...body,
        createdAt: new Date()
      }

      await db.collection('portfolio').insertOne(item)
      return handleCORS(NextResponse.json({ success: true, item }))
    }

    // DELETE /api/admin/portfolio/:id - Delete portfolio item
    if (route.startsWith('/admin/portfolio/') && method === 'DELETE') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const itemId = path[2]
      await db.collection('portfolio').deleteOne({ id: itemId })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== MESSAGES/CHAT ROUTES ====================

    // POST /api/messages - Send message to admin
    if (route === '/messages' && method === 'POST') {
      const body = await request.json()
      
      if (!body.email || !body.message) {
        return handleCORS(NextResponse.json(
          { error: 'Email y mensaje son requeridos' },
          { status: 400 }
        ))
      }

      const msg = {
        id: uuidv4(),
        ...body,
        quoteId: body.quoteId || null,
        read: false,
        createdAt: new Date()
      }

      await db.collection('messages').insertOne(msg)
      console.log(`[EMAIL MOCKED] Nuevo mensaje de ${body.email}`)
      
      return handleCORS(NextResponse.json({ success: true }))
    }

    // GET /api/admin/messages - Get all messages (admin)
    if (route === '/admin/messages' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const messages = await db.collection('messages')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedMessages = messages.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedMessages))
    }

    // PUT /api/admin/messages/:id - Mark message as read
    if (route.startsWith('/admin/messages/') && method === 'PUT') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const messageId = path[2]
      await db.collection('messages').updateOne(
        { id: messageId },
        { $set: { read: true } }
      )
      
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== WEBPAY ROUTES (SANDBOX/MOCK) ====================

    // POST /api/webpay/initiate - Initiate payment (MOCKED for now)
    if (route === '/webpay/initiate' && method === 'POST') {
      const body = await request.json()
      
      // For now, return a mock response
      // When real credentials are available, implement actual Webpay integration
      const mockToken = `WP_${uuidv4()}`
      const mockSessionId = uuidv4()
      
      // Save payment attempt
      const payment = {
        id: uuidv4(),
        quoteId: body.quoteId,
        amount: body.amount,
        token: mockToken,
        sessionId: mockSessionId,
        status: 'pending',
        createdAt: new Date()
      }
      
      await db.collection('payments').insertOne(payment)
      
      return handleCORS(NextResponse.json({
        success: true,
        message: 'Webpay está en modo sandbox. Integración completa disponible con credenciales de producción.',
        mockData: {
          token: mockToken,
          sessionId: mockSessionId,
          redirectUrl: null // Would be Webpay URL in production
        }
      }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Ruta ${route} no encontrada` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
