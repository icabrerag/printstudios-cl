// Chatbot Flow Engine - State Machine para cotizaciones 3D

// Tipos de intención
export const INTENT_TYPES = {
  A: { id: 'A', name: 'Imprimir desde archivo 3D', description: 'Ya tengo STL/OBJ/3MF' },
  B: { id: 'B', name: 'Diseñar/modelar desde cero', description: 'Solo idea/fotos' },
  C: { id: 'C', name: 'Duplicar pieza física', description: 'Tengo pieza o fotos' },
  D: { id: 'D', name: 'Reparar pieza', description: 'Pieza dañada / requiere refuerzo' },
  E: { id: 'E', name: 'Reflejar/espejar pieza', description: 'Mirror de pieza existente' },
  F: { id: 'F', name: 'Prototipo funcional vs decorativo', description: 'Definir tipo de uso' }
}

// Estados del flujo
export const STATES = {
  GREETING: 'GREETING',
  INTENT_DETECTION: 'INTENT_DETECTION',
  DESCRIPTION: 'DESCRIPTION',
  FILE_CHECK: 'FILE_CHECK',
  FILE_UPLOAD: 'FILE_UPLOAD',
  PHOTO_UPLOAD: 'PHOTO_UPLOAD',
  DIMENSIONS: 'DIMENSIONS',
  USAGE: 'USAGE',
  QUANTITY: 'QUANTITY',
  MATERIAL: 'MATERIAL',
  COLOR: 'COLOR',
  FINISH: 'FINISH',
  TOLERANCE: 'TOLERANCE',
  DEADLINE: 'DEADLINE',
  DELIVERY: 'DELIVERY',
  BUDGET: 'BUDGET',
  CONTACT: 'CONTACT',
  SUMMARY: 'SUMMARY',
  COMPLETE: 'COMPLETE'
}

// Materiales disponibles
export const MATERIALS = {
  PLA: { name: 'PLA', description: 'Biodegradable, ideal para decoración interior', recommended_for: ['decorativo', 'interior'] },
  PETG: { name: 'PETG', description: 'Resistente, bueno para piezas funcionales', recommended_for: ['funcional', 'exterior', 'calor'] },
  ABS: { name: 'ABS', description: 'Alta resistencia térmica y mecánica', recommended_for: ['funcional', 'exterior', 'automotriz'] },
  TPU: { name: 'TPU', description: 'Flexible, ideal para amortiguadores y sellos', recommended_for: ['flexible', 'amortiguador'] },
  RESINA: { name: 'Resina', description: 'Alta precisión, ideal para miniaturas', recommended_for: ['miniatura', 'joyeria', 'detalle'] },
  NO_SE: { name: 'No sé', description: 'Te recomendaremos según el uso' }
}

// Colores disponibles
export const COLORS = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Transparente', 'A definir']

// Acabados
export const FINISHES = {
  ESTANDAR: { name: 'Estándar', description: 'Directo de impresora' },
  LIJADO: { name: 'Lijado', description: 'Superficie suavizada' },
  PINTADO: { name: 'Pintado', description: 'Color profesional aplicado' },
  ALTA_CALIDAD: { name: 'Alta calidad', description: 'Lijado + pintado + acabado premium' }
}

// Mensajes del bot
export const BOT_MESSAGES = {
  GREETING: `¡Hola! 👋 Soy el asistente de PrintStudios.cl

Te voy a ayudar a cotizar tu proyecto de impresión 3D paso a paso. Será rápido, te lo prometo.

¿Qué te gustaría hacer hoy?`,

  INTENT_OPTIONS: `Elige una opción:

A) 📁 **Imprimir desde archivo 3D** - Ya tengo mi STL/OBJ/3MF
B) ✏️ **Diseñar desde cero** - Tengo una idea o fotos de referencia
C) 🔄 **Duplicar una pieza** - Tengo la pieza física o fotos
D) 🔧 **Reparar una pieza** - Mi pieza está dañada
E) 🪞 **Reflejar/espejar** - Necesito el mirror de una pieza
F) ❓ **No estoy seguro** - Necesito orientación`,

  ASK_DESCRIPTION: '¡Perfecto! Cuéntame en pocas palabras: **¿Qué necesitas imprimir?** 🤔\n\nPor ejemplo: "una carcasa para Arduino", "un soporte de celular", "una figura de dragón"...',

  ASK_HAS_FILE: '¿Tienes ya el **archivo 3D** (STL, OBJ, 3MF o STEP)?\n\n✅ **Sí, lo tengo**\n❌ **No, necesito que lo diseñen**',

  ASK_FILE_UPLOAD: '¡Genial! 📎 Por favor **sube tu archivo 3D** aquí.\n\nFormatos aceptados: STL, OBJ, 3MF, STEP (máx 50MB)',

  ASK_PHOTOS: `Como no tienes archivo 3D, necesito que me envíes **fotos de referencia** 📸

**Tips para buenas fotos:**
• Toma desde 3 ángulos (frente, lado, arriba)
• Incluye algo para escala (moneda, regla, o cinta métrica)
• Buena iluminación, sin sombras fuertes

Puedes subir hasta 5 imágenes (JPG, PNG)`,

  ASK_DIMENSIONS: `¿Cuáles son las **dimensiones aproximadas**? 📏

Indica en mm o cm:
• Largo: ?
• Ancho: ?
• Alto: ?

Si no sabes exactamente, escribe "no sé" y te explico cómo medir fácilmente.`,

  EXPLAIN_DIMENSIONS: `¡Tranquilo! Es fácil medir:

📏 **Método rápido:**
1. Usa una regla o cinta métrica
2. Mide el largo (dimensión más grande)
3. Mide el ancho
4. Mide la altura

📱 **Método con celular:**
Puedes usar apps como "Measure" o simplemente poner una moneda al lado y dime el tamaño relativo.

¿Puedes intentar de nuevo con las medidas aproximadas?`,

  ASK_USAGE: `¿Para qué se va a **usar** esta pieza? 🎯

🏠 **Decorativo interior** - Adorno, figura, display
⚙️ **Funcional interior** - Pieza mecánica, soporte, herramienta
☀️ **Uso exterior** - Expuesto al sol/lluvia
🔥 **Cerca de calor** - Motor, electrónica, cocina
💪 **Alta resistencia** - Carga mecánica, golpes`,

  ASK_QUANTITY: '¿Cuántas **unidades** necesitas? 🔢\n\n(Si no estás seguro, podemos cotizar diferentes cantidades)',

  ASK_MATERIAL: `¿Qué **material** prefieres? 🧪

• **PLA** - Económico, decorativo
• **PETG** - Resistente, funcional
• **ABS** - Alta temperatura
• **TPU** - Flexible
• **Resina** - Alta precisión/detalle
• **No sé** - Te recomiendo según el uso`,

  ASK_COLOR: '¿Qué **color** te gustaría? 🎨\n\nOpciones: Blanco, Negro, Gris, Rojo, Azul, Verde, Amarillo, Naranja, Transparente\n\nO escribe "a definir" si prefieres decidir después.',

  ASK_FINISH: `¿Qué tipo de **acabado** necesitas? ✨

• **Estándar** - Directo de impresora (económico)
• **Lijado** - Superficie suavizada
• **Pintado** - Color profesional aplicado
• **Alta calidad** - Lijado + pintado + acabado premium`,

  ASK_TOLERANCE: `Como es una pieza **funcional**, necesito saber sobre tolerancias y encajes 🔩

¿La pieza debe encajar con otras partes?
• Si tiene tornillos, ¿qué medida? (M3, M4, M5...)
• ¿Necesita holgura específica?
• ¿Debe encajar con otra pieza existente?

Si no aplica, escribe "no aplica"`,

  ASK_DEADLINE: `¿Para cuándo lo necesitas? 📅

🚀 **Urgente** - Lo antes posible (+30% recargo)
📦 **Normal** - 5-7 días hábiles
🐢 **Flexible** - Sin apuro, mejor precio`,

  ASK_DELIVERY: `¿Cómo prefieres recibir tu pedido? 🚚

🏪 **Retiro en taller** - Santiago, sector...
📬 **Envío a domicilio** - Indica tu comuna/ciudad`,

  ASK_DELIVERY_ADDRESS: '¿A qué **comuna y ciudad** te lo enviamos? 🗺️',

  ASK_BUDGET: '¿Tienes un **presupuesto estimado** en mente? 💰\n\nEsto nos ayuda a ajustar la propuesta. Si no tienes claro, escribe "abierto".',

  ASK_CONTACT: `¡Ya casi terminamos! 🎉

Necesito tus datos de contacto:

👤 **Nombre:**
📧 **Email:**
📱 **WhatsApp:** (con código +56)`,

  SUMMARY_INTRO: '¡Excelente! Déjame resumir tu solicitud... 📋',

  COMPLETE: `✅ **¡Solicitud enviada con éxito!**

Nuestro equipo revisará tu proyecto y te contactaremos en las próximas **24-48 horas** con una cotización detallada.

📧 Revisa tu email (y spam por si acaso)
📱 También te escribiremos por WhatsApp

¿Tienes otra consulta? Puedes escribirme cuando quieras.

¡Gracias por confiar en PrintStudios.cl! 🙌`
}

// Función para recomendar material según uso
export function recommendMaterial(usage) {
  const usageLower = usage.toLowerCase()
  
  if (usageLower.includes('decorat') || usageLower.includes('figura') || usageLower.includes('adorno')) {
    return { material: 'PLA', reason: 'Para uso decorativo interior, PLA es perfecto: económico y con buen acabado.' }
  }
  if (usageLower.includes('exterior') || usageLower.includes('sol') || usageLower.includes('lluvia')) {
    return { material: 'PETG', reason: 'Para exterior, PETG resiste mejor los rayos UV y la humedad.' }
  }
  if (usageLower.includes('calor') || usageLower.includes('motor') || usageLower.includes('temperatura')) {
    return { material: 'ABS', reason: 'Para zonas con calor, ABS soporta hasta 100°C sin deformarse.' }
  }
  if (usageLower.includes('flex') || usageLower.includes('goma') || usageLower.includes('sello')) {
    return { material: 'TPU', reason: 'Para piezas flexibles, TPU es el indicado: se dobla sin romperse.' }
  }
  if (usageLower.includes('miniatura') || usageLower.includes('detalle') || usageLower.includes('joya')) {
    return { material: 'Resina', reason: 'Para alta precisión y detalles finos, la resina es ideal.' }
  }
  if (usageLower.includes('funcional') || usageLower.includes('mecanic') || usageLower.includes('resist')) {
    return { material: 'PETG', reason: 'Para piezas funcionales, PETG ofrece buena resistencia mecánica.' }
  }
  
  return { material: 'PLA', reason: 'PLA es versátil y económico para la mayoría de proyectos.' }
}

// Función para validar respuestas requeridas
export function validateRequirements(data) {
  const missing = []
  
  if (!data.description) missing.push('descripción del proyecto')
  if (!data.hasFile && (!data.photos || data.photos.length === 0)) missing.push('archivo 3D o fotos de referencia')
  if (!data.dimensions && !data.dimensionsUnknown) missing.push('dimensiones aproximadas')
  if (!data.quantity) missing.push('cantidad de unidades')
  if (!data.usage) missing.push('uso/propósito de la pieza')
  if (!data.contact?.name || !data.contact?.email) missing.push('datos de contacto')
  
  return {
    isComplete: missing.length === 0,
    missing
  }
}

// Motor de flujo - determina siguiente estado
export function getNextState(currentState, data, userResponse) {
  switch (currentState) {
    case STATES.GREETING:
      return STATES.INTENT_DETECTION
    
    case STATES.INTENT_DETECTION:
      return STATES.DESCRIPTION
    
    case STATES.DESCRIPTION:
      return STATES.FILE_CHECK
    
    case STATES.FILE_CHECK:
      if (userResponse.toLowerCase().includes('sí') || userResponse.toLowerCase().includes('si') || userResponse.toLowerCase() === 'yes') {
        return STATES.FILE_UPLOAD
      }
      return STATES.PHOTO_UPLOAD
    
    case STATES.FILE_UPLOAD:
    case STATES.PHOTO_UPLOAD:
      return STATES.DIMENSIONS
    
    case STATES.DIMENSIONS:
      if (userResponse.toLowerCase().includes('no sé') || userResponse.toLowerCase().includes('no se')) {
        return STATES.DIMENSIONS // Stay and show help
      }
      return STATES.USAGE
    
    case STATES.USAGE:
      return STATES.QUANTITY
    
    case STATES.QUANTITY:
      return STATES.MATERIAL
    
    case STATES.MATERIAL:
      return STATES.COLOR
    
    case STATES.COLOR:
      return STATES.FINISH
    
    case STATES.FINISH:
      // Si es funcional, preguntar tolerancias
      if (data.usage && (data.usage.includes('funcional') || data.usage.includes('mecanic'))) {
        return STATES.TOLERANCE
      }
      return STATES.DEADLINE
    
    case STATES.TOLERANCE:
      return STATES.DEADLINE
    
    case STATES.DEADLINE:
      return STATES.DELIVERY
    
    case STATES.DELIVERY:
      if (userResponse.toLowerCase().includes('envío') || userResponse.toLowerCase().includes('envio') || userResponse.toLowerCase().includes('domicilio')) {
        return STATES.DELIVERY // Ask for address
      }
      return STATES.BUDGET
    
    case STATES.BUDGET:
      return STATES.CONTACT
    
    case STATES.CONTACT:
      return STATES.SUMMARY
    
    case STATES.SUMMARY:
      return STATES.COMPLETE
    
    default:
      return STATES.COMPLETE
  }
}

// Genera el mensaje del bot según el estado
export function getBotMessage(state, data = {}) {
  switch (state) {
    case STATES.GREETING:
      return BOT_MESSAGES.GREETING
    
    case STATES.INTENT_DETECTION:
      return BOT_MESSAGES.INTENT_OPTIONS
    
    case STATES.DESCRIPTION:
      return BOT_MESSAGES.ASK_DESCRIPTION
    
    case STATES.FILE_CHECK:
      return BOT_MESSAGES.ASK_HAS_FILE
    
    case STATES.FILE_UPLOAD:
      return BOT_MESSAGES.ASK_FILE_UPLOAD
    
    case STATES.PHOTO_UPLOAD:
      return BOT_MESSAGES.ASK_PHOTOS
    
    case STATES.DIMENSIONS:
      if (data.showDimensionHelp) {
        return BOT_MESSAGES.EXPLAIN_DIMENSIONS
      }
      return BOT_MESSAGES.ASK_DIMENSIONS
    
    case STATES.USAGE:
      return BOT_MESSAGES.ASK_USAGE
    
    case STATES.QUANTITY:
      return BOT_MESSAGES.ASK_QUANTITY
    
    case STATES.MATERIAL:
      let materialMsg = BOT_MESSAGES.ASK_MATERIAL
      if (data.usage) {
        const rec = recommendMaterial(data.usage)
        materialMsg += `\n\n💡 **Mi recomendación:** ${rec.material}\n${rec.reason}`
      }
      return materialMsg
    
    case STATES.COLOR:
      return BOT_MESSAGES.ASK_COLOR
    
    case STATES.FINISH:
      return BOT_MESSAGES.ASK_FINISH
    
    case STATES.TOLERANCE:
      return BOT_MESSAGES.ASK_TOLERANCE
    
    case STATES.DEADLINE:
      return BOT_MESSAGES.ASK_DEADLINE
    
    case STATES.DELIVERY:
      if (data.needsAddress) {
        return BOT_MESSAGES.ASK_DELIVERY_ADDRESS
      }
      return BOT_MESSAGES.ASK_DELIVERY
    
    case STATES.BUDGET:
      return BOT_MESSAGES.ASK_BUDGET
    
    case STATES.CONTACT:
      return BOT_MESSAGES.ASK_CONTACT
    
    case STATES.SUMMARY:
      return generateSummary(data)
    
    case STATES.COMPLETE:
      return BOT_MESSAGES.COMPLETE
    
    default:
      return '¿En qué más puedo ayudarte?'
  }
}

// Genera resumen de la solicitud
function generateSummary(data) {
  let summary = BOT_MESSAGES.SUMMARY_INTRO + '\n\n'
  summary += '📋 **Resumen de tu solicitud:**\n\n'
  
  if (data.description) summary += `📝 **Proyecto:** ${data.description}\n`
  if (data.intent) summary += `🎯 **Tipo:** ${INTENT_TYPES[data.intent]?.name || data.intent}\n`
  if (data.dimensions) summary += `📏 **Dimensiones:** ${data.dimensions}\n`
  if (data.quantity) summary += `🔢 **Cantidad:** ${data.quantity} unidad(es)\n`
  if (data.usage) summary += `⚙️ **Uso:** ${data.usage}\n`
  if (data.material) summary += `🧪 **Material:** ${data.material}\n`
  if (data.color) summary += `🎨 **Color:** ${data.color}\n`
  if (data.finish) summary += `✨ **Acabado:** ${data.finish}\n`
  if (data.deadline) summary += `📅 **Urgencia:** ${data.deadline}\n`
  if (data.delivery) summary += `🚚 **Entrega:** ${data.delivery}\n`
  if (data.budget) summary += `💰 **Presupuesto:** ${data.budget}\n`
  
  const fileCount = (data.files?.length || 0) + (data.photos?.length || 0)
  if (fileCount > 0) summary += `📎 **Archivos adjuntos:** ${fileCount}\n`
  
  summary += '\n¿Todo correcto? Escribe **"confirmar"** para enviar o **"corregir"** si necesitas cambiar algo.'
  
  return summary
}

// Procesa la respuesta del usuario y extrae datos
export function processUserResponse(state, response, currentData = {}) {
  const data = { ...currentData }
  const responseLower = response.toLowerCase().trim()
  
  switch (state) {
    case STATES.INTENT_DETECTION:
      if (responseLower.includes('a)') || responseLower === 'a' || responseLower.includes('archivo')) {
        data.intent = 'A'
        data.hasFile = true
      } else if (responseLower.includes('b)') || responseLower === 'b' || responseLower.includes('diseñar') || responseLower.includes('cero')) {
        data.intent = 'B'
        data.hasFile = false
      } else if (responseLower.includes('c)') || responseLower === 'c' || responseLower.includes('duplicar')) {
        data.intent = 'C'
        data.hasFile = false
      } else if (responseLower.includes('d)') || responseLower === 'd' || responseLower.includes('reparar')) {
        data.intent = 'D'
      } else if (responseLower.includes('e)') || responseLower === 'e' || responseLower.includes('reflejar') || responseLower.includes('espejar')) {
        data.intent = 'E'
      } else if (responseLower.includes('f)') || responseLower === 'f' || responseLower.includes('seguro')) {
        data.intent = 'F'
      }
      break
    
    case STATES.DESCRIPTION:
      data.description = response
      break
    
    case STATES.FILE_CHECK:
      data.hasFile = responseLower.includes('sí') || responseLower.includes('si') || responseLower === 'yes'
      break
    
    case STATES.DIMENSIONS:
      if (responseLower.includes('no sé') || responseLower.includes('no se')) {
        data.showDimensionHelp = true
        data.dimensionsUnknown = true
      } else {
        data.dimensions = response
        data.showDimensionHelp = false
      }
      break
    
    case STATES.USAGE:
      data.usage = response
      break
    
    case STATES.QUANTITY:
      const qty = parseInt(response.replace(/\D/g, ''))
      data.quantity = qty > 0 ? qty : 1
      break
    
    case STATES.MATERIAL:
      data.material = response
      if (responseLower.includes('no sé') || responseLower.includes('no se')) {
        const rec = recommendMaterial(data.usage || '')
        data.material = rec.material
        data.materialRecommended = true
      }
      break
    
    case STATES.COLOR:
      data.color = response
      break
    
    case STATES.FINISH:
      data.finish = response
      break
    
    case STATES.TOLERANCE:
      data.tolerance = response
      break
    
    case STATES.DEADLINE:
      if (responseLower.includes('urgente')) {
        data.deadline = 'Urgente'
        data.urgent = true
      } else if (responseLower.includes('flexible') || responseLower.includes('sin apuro')) {
        data.deadline = 'Flexible'
      } else {
        data.deadline = 'Normal (5-7 días)'
      }
      break
    
    case STATES.DELIVERY:
      if (responseLower.includes('retiro') || responseLower.includes('taller')) {
        data.delivery = 'Retiro en taller'
        data.needsAddress = false
      } else if (responseLower.includes('envío') || responseLower.includes('envio') || responseLower.includes('domicilio')) {
        data.delivery = 'Envío a domicilio'
        data.needsAddress = true
      } else if (data.needsAddress) {
        data.deliveryAddress = response
        data.delivery = `Envío a ${response}`
        data.needsAddress = false
      }
      break
    
    case STATES.BUDGET:
      data.budget = responseLower === 'abierto' ? 'Abierto' : response
      break
    
    case STATES.CONTACT:
      // Parse contact info
      const lines = response.split('\n')
      data.contact = data.contact || {}
      
      for (const line of lines) {
        const lineLower = line.toLowerCase()
        if (lineLower.includes('nombre') || lineLower.includes('name')) {
          data.contact.name = line.split(':').pop()?.trim() || line
        } else if (lineLower.includes('email') || lineLower.includes('@')) {
          const emailMatch = line.match(/[\w.-]+@[\w.-]+\.[\w]+/)
          data.contact.email = emailMatch ? emailMatch[0] : line.split(':').pop()?.trim()
        } else if (lineLower.includes('whatsapp') || lineLower.includes('fono') || lineLower.includes('+56') || /\d{8,}/.test(line)) {
          const phoneMatch = line.match(/[+]?[\d\s-]{8,}/)
          data.contact.whatsapp = phoneMatch ? phoneMatch[0].trim() : line.split(':').pop()?.trim()
        } else if (!data.contact.name && line.trim()) {
          // First non-empty line without label is probably the name
          data.contact.name = line.trim()
        }
      }
      break
    
    case STATES.SUMMARY:
      data.confirmed = responseLower.includes('confirmar') || responseLower.includes('ok') || responseLower.includes('correcto')
      data.needsCorrection = responseLower.includes('corregir') || responseLower.includes('cambiar')
      break
  }
  
  return data
}
