import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { 
  STATES, 
  INTENT_TYPES, 
  getBotMessage, 
  getNextState, 
  processUserResponse, 
  validateRequirements,
  recommendMaterial 
} from '@/frontend/lib/chatbot/flowEngine'

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
        source: 'form',
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

    // ==================== CHATBOT ROUTES ====================

    // POST /api/chat/start - Start a new chat session
    if (route === '/chat/start' && method === 'POST') {
      const body = await request.json()
      
      const session = {
        id: uuidv4(),
        guestId: body.guestId || uuidv4(),
        state: STATES.GREETING,
        data: {},
        messages: [],
        files: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add initial bot message
      const greeting = getBotMessage(STATES.GREETING)
      session.messages.push({
        id: uuidv4(),
        role: 'bot',
        content: greeting,
        timestamp: new Date()
      })

      await db.collection('chat_sessions').insertOne(session)

      return handleCORS(NextResponse.json({
        sessionId: session.id,
        guestId: session.guestId,
        message: greeting,
        state: STATES.GREETING,
        nextState: STATES.INTENT_DETECTION
      }))
    }

    // POST /api/chat/message - Send message and get response
    if (route === '/chat/message' && method === 'POST') {
      const body = await request.json()
      const { sessionId, message, fileUrls } = body

      if (!sessionId || !message) {
        return handleCORS(NextResponse.json(
          { error: 'sessionId y message son requeridos' },
          { status: 400 }
        ))
      }

      const session = await db.collection('chat_sessions').findOne({ id: sessionId })
      if (!session) {
        return handleCORS(NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        ))
      }

      // Add user message
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        fileUrls: fileUrls || [],
        timestamp: new Date()
      }
      session.messages.push(userMessage)

      // Process response and update data
      let currentState = session.state
      let data = processUserResponse(currentState, message, session.data)
      
      // Handle file uploads
      if (fileUrls && fileUrls.length > 0) {
        if (currentState === STATES.FILE_UPLOAD) {
          data.files = [...(data.files || []), ...fileUrls]
          data.hasFile = true
        } else if (currentState === STATES.PHOTO_UPLOAD) {
          data.photos = [...(data.photos || []), ...fileUrls]
        }
      }

      // Determine next state
      let nextState = getNextState(currentState, data, message)
      
      // Special handling for dimension help
      if (currentState === STATES.DIMENSIONS && data.showDimensionHelp) {
        nextState = STATES.DIMENSIONS // Stay in dimensions with help message
      }
      
      // Special handling for delivery address
      if (currentState === STATES.DELIVERY && data.needsAddress) {
        nextState = STATES.DELIVERY // Stay to get address
      }
      
      // Special handling for summary confirmation
      if (currentState === STATES.SUMMARY) {
        if (data.confirmed) {
          nextState = STATES.COMPLETE
        } else if (data.needsCorrection) {
          nextState = STATES.DESCRIPTION // Restart from description
        }
      }

      // Get bot response
      const botResponse = getBotMessage(nextState, data)
      
      // Add bot message
      const botMessage = {
        id: uuidv4(),
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      }
      session.messages.push(botMessage)

      // Update session
      const updateData = {
        state: nextState,
        data: data,
        messages: session.messages,
        updatedAt: new Date()
      }

      // If complete, create quote request
      let quoteRequestId = null
      if (nextState === STATES.COMPLETE && data.confirmed) {
        const validation = validateRequirements(data)
        
        const quoteRequest = {
          id: uuidv4(),
          sessionId: session.id,
          guestId: session.guestId,
          intentType: data.intent || 'F',
          requirements: data,
          attachments: [
            ...(data.files || []).map(url => ({ url, type: '3d_model' })),
            ...(data.photos || []).map(url => ({ url, type: 'photo' }))
          ],
          status: 'NEW',
          source: 'chatbot',
          isComplete: validation.isComplete,
          missingInfo: validation.missing,
          summary: generateQuoteSummary(data),
          contact: data.contact,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await db.collection('quote_requests').insertOne(quoteRequest)
        quoteRequestId = quoteRequest.id
        updateData.status = 'completed'
        updateData.quoteRequestId = quoteRequestId

        console.log(`[CHATBOT] Nueva solicitud generada: ${quoteRequestId}`)
        console.log(`[EMAIL MOCKED] Notificación de nueva solicitud bot a ${data.contact?.email}`)
      }

      await db.collection('chat_sessions').updateOne(
        { id: sessionId },
        { $set: updateData }
      )

      return handleCORS(NextResponse.json({
        message: botResponse,
        state: nextState,
        data: data,
        quoteRequestId,
        isComplete: nextState === STATES.COMPLETE
      }))
    }

    // GET /api/chat/session/:id - Get session to resume
    if (route.startsWith('/chat/session/') && method === 'GET') {
      const sessionId = path[2]
      const session = await db.collection('chat_sessions').findOne({ id: sessionId })
      
      if (!session) {
        return handleCORS(NextResponse.json(
          { error: 'Sesión no encontrada' },
          { status: 404 }
        ))
      }

      const { _id, ...cleanSession } = session
      return handleCORS(NextResponse.json(cleanSession))
    }

    // GET /api/chat/resume/:guestId - Resume session by guestId
    if (route.startsWith('/chat/resume/') && method === 'GET') {
      const guestId = path[2]
      const session = await db.collection('chat_sessions').findOne(
        { guestId, status: 'active' },
        { sort: { updatedAt: -1 } }
      )
      
      if (!session) {
        return handleCORS(NextResponse.json({ session: null }))
      }

      const { _id, ...cleanSession } = session
      return handleCORS(NextResponse.json({ session: cleanSession }))
    }

    // POST /api/chat/upload - Upload file for chat
    if (route === '/chat/upload' && method === 'POST') {
      // For MVP, we'll store file metadata and return a mock URL
      // In production, integrate with S3 or similar
      const body = await request.json()
      const { sessionId, fileName, fileType, fileSize } = body

      // Validate file type
      const allowed3D = ['.stl', '.obj', '.3mf', '.step', '.stp']
      const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const allowedDocs = ['.pdf']
      const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      
      const isAllowed = [...allowed3D, ...allowedImages, ...allowedDocs].includes(ext)
      if (!isAllowed) {
        return handleCORS(NextResponse.json(
          { error: 'Tipo de archivo no permitido' },
          { status: 400 }
        ))
      }

      // Max 50MB
      if (fileSize > 50 * 1024 * 1024) {
        return handleCORS(NextResponse.json(
          { error: 'Archivo muy grande (máx 50MB)' },
          { status: 400 }
        ))
      }

      const fileRecord = {
        id: uuidv4(),
        sessionId,
        fileName,
        fileType,
        fileSize,
        fileCategory: allowed3D.includes(ext) ? '3d_model' : allowedImages.includes(ext) ? 'image' : 'document',
        // In production, this would be the S3 URL
        url: `/uploads/${sessionId}/${uuidv4()}_${fileName}`,
        uploadedAt: new Date()
      }

      await db.collection('chat_files').insertOne(fileRecord)

      return handleCORS(NextResponse.json({
        success: true,
        file: {
          id: fileRecord.id,
          url: fileRecord.url,
          fileName: fileRecord.fileName,
          fileCategory: fileRecord.fileCategory
        }
      }))
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
      
      // Bot requests stats
      const totalBotRequests = await db.collection('quote_requests').countDocuments()
      const newBotRequests = await db.collection('quote_requests').countDocuments({ status: 'NEW' })
      
      // Calculate revenue from completed orders
      const completedOrdersData = await db.collection('quotes').find({ status: 'completed' }).toArray()
      const totalRevenue = completedOrdersData.reduce((sum, order) => sum + (order.estimatedPrice || 0), 0)
      
      // Recent quotes
      const recentQuotes = await db.collection('quotes')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()

      // Recent bot requests
      const recentBotRequests = await db.collection('quote_requests')
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
          totalRevenue,
          totalBotRequests,
          newBotRequests
        },
        recentQuotes: recentQuotes.map(({ _id, ...rest }) => rest),
        recentBotRequests: recentBotRequests.map(({ _id, ...rest }) => rest)
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

    // ==================== ADMIN BOT REQUESTS ====================

    // GET /api/admin/bot-requests - Get all bot quote requests
    if (route === '/admin/bot-requests' && method === 'GET') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const requests = await db.collection('quote_requests')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
      
      const cleanedRequests = requests.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleanedRequests))
    }

    // GET /api/admin/bot-requests/:id - Get single bot request with conversation
    if (route.startsWith('/admin/bot-requests/') && method === 'GET' && path.length === 3) {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const requestId = path[2]
      const quoteRequest = await db.collection('quote_requests').findOne({ id: requestId })
      
      if (!quoteRequest) {
        return handleCORS(NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        ))
      }

      // Get associated chat session
      const session = await db.collection('chat_sessions').findOne({ id: quoteRequest.sessionId })
      
      const { _id: _1, ...cleanRequest } = quoteRequest
      const cleanSession = session ? (({ _id, ...rest }) => rest)(session) : null

      return handleCORS(NextResponse.json({
        request: cleanRequest,
        conversation: cleanSession?.messages || []
      }))
    }

    // PUT /api/admin/bot-requests/:id - Update bot request status
    if (route.startsWith('/admin/bot-requests/') && method === 'PUT' && path.length === 3) {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const requestId = path[2]
      const body = await request.json()

      const result = await db.collection('quote_requests').updateOne(
        { id: requestId },
        { $set: { ...body, updatedAt: new Date() } }
      )

      if (result.matchedCount === 0) {
        return handleCORS(NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        ))
      }

      return handleCORS(NextResponse.json({ success: true }))
    }

    // POST /api/admin/bot-requests/:id/convert - Convert bot request to quote
    if (route.startsWith('/admin/bot-requests/') && route.endsWith('/convert') && method === 'POST') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const requestId = path[2]
      const body = await request.json()
      const { estimatedPrice, estimatedDays, notes } = body

      const quoteRequest = await db.collection('quote_requests').findOne({ id: requestId })
      if (!quoteRequest) {
        return handleCORS(NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        ))
      }

      // Create formal quote from bot request
      const quote = {
        id: uuidv4(),
        sourceRequestId: requestId,
        source: 'chatbot',
        name: quoteRequest.contact?.name || 'Cliente Bot',
        email: quoteRequest.contact?.email,
        phone: quoteRequest.contact?.whatsapp,
        serviceId: 'custom_3d',
        description: quoteRequest.requirements?.description,
        material: quoteRequest.requirements?.material,
        color: quoteRequest.requirements?.color,
        quantity: quoteRequest.requirements?.quantity,
        estimatedPrice: estimatedPrice || 0,
        estimatedDays: estimatedDays || 7,
        adminNotes: notes,
        requirements: quoteRequest.requirements,
        attachments: quoteRequest.attachments,
        status: 'quoted',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('quotes').insertOne(quote)

      // Update bot request status
      await db.collection('quote_requests').updateOne(
        { id: requestId },
        { 
          $set: { 
            status: 'QUOTED',
            quoteId: quote.id,
            quotedAt: new Date(),
            quotedBy: user.email,
            updatedAt: new Date()
          } 
        }
      )

      console.log(`[EMAIL MOCKED] Cotización enviada a ${quote.email}: $${estimatedPrice} CLP`)

      return handleCORS(NextResponse.json({ 
        success: true, 
        quoteId: quote.id,
        message: 'Solicitud convertida a cotización' 
      }))
    }

    // POST /api/admin/bot-requests/:id/request-info - Request more info from client
    if (route.startsWith('/admin/bot-requests/') && route.endsWith('/request-info') && method === 'POST') {
      const user = await verifyToken(request)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'No autorizado' }, { status: 401 }))
      }

      const requestId = path[2]
      const body = await request.json()
      const { message } = body

      const quoteRequest = await db.collection('quote_requests').findOne({ id: requestId })
      if (!quoteRequest) {
        return handleCORS(NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        ))
      }

      // Add admin message to communication log
      const adminMessage = {
        id: uuidv4(),
        type: 'info_request',
        from: 'admin',
        message,
        timestamp: new Date()
      }

      await db.collection('quote_requests').updateOne(
        { id: requestId },
        { 
          $push: { adminMessages: adminMessage },
          $set: { 
            status: 'WAITING_INFO',
            updatedAt: new Date()
          }
        }
      )

      console.log(`[EMAIL MOCKED] Solicitud de info a ${quoteRequest.contact?.email}: ${message}`)
      console.log(`[WHATSAPP MOCKED] Mensaje a ${quoteRequest.contact?.whatsapp}: ${message}`)

      return handleCORS(NextResponse.json({ success: true, message: 'Solicitud enviada al cliente' }))
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
      const mockToken = `WP_${uuidv4()}`
      const mockSessionId = uuidv4()
      
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
        message: 'Webpay está en modo sandbox.',
        mockData: {
          token: mockToken,
          sessionId: mockSessionId,
          redirectUrl: null
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

// Helper function to generate quote summary for admin
function generateQuoteSummary(data) {
  const bullets = []
  const risks = []
  const questions = []

  bullets.push(`Proyecto: ${data.description || 'No especificado'}`)
  bullets.push(`Tipo: ${INTENT_TYPES[data.intent]?.name || 'General'}`)
  
  if (data.hasFile) {
    bullets.push('✅ Tiene archivo 3D')
  } else if (data.photos?.length > 0) {
    bullets.push(`📷 ${data.photos.length} fotos de referencia`)
    risks.push('Requiere modelado 3D desde fotos')
  } else {
    risks.push('⚠️ Sin archivo 3D ni fotos')
  }

  if (data.dimensions) {
    bullets.push(`Dimensiones: ${data.dimensions}`)
  } else {
    questions.push('Confirmar dimensiones exactas')
  }

  bullets.push(`Material: ${data.material || 'Por definir'}`)
  bullets.push(`Cantidad: ${data.quantity || 1} unidad(es)`)
  bullets.push(`Urgencia: ${data.deadline || 'Normal'}`)

  if (data.urgent) {
    risks.push('🚨 Pedido urgente - considerar recargo')
  }

  if (data.usage?.toLowerCase().includes('exterior')) {
    risks.push('☀️ Uso exterior - verificar material UV resistente')
  }

  if (data.tolerance && data.tolerance !== 'no aplica') {
    bullets.push(`Tolerancias: ${data.tolerance}`)
    risks.push('🔩 Pieza funcional - revisar tolerancias')
  }

  return {
    bullets,
    risks,
    questions,
    contact: data.contact
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
