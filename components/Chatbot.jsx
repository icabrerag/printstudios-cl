'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Loader2, 
  Bot, 
  User,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Box
} from 'lucide-react'

// Format message with markdown-like styling
const formatMessage = (text) => {
  if (!text) return null
  
  return text.split('\n').map((line, i) => {
    // Bold text
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Emoji bullet points
    line = line.replace(/^([A-F]\))/, '<span class="font-bold text-primary">$1</span>')
    
    return (
      <span key={i} className="block" dangerouslySetInnerHTML={{ __html: line }} />
    )
  })
}

// Message bubble component
const MessageBubble = ({ message, isBot }) => {
  const bgColor = isBot ? 'bg-muted' : 'bg-primary text-white'
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`flex items-start gap-2 max-w-[85%] ${isBot ? '' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        <div className={`rounded-2xl px-4 py-3 ${bgColor} ${isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatMessage(message.content)}
          </div>
          {message.fileUrls && message.fileUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.fileUrls.map((url, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <Paperclip className="w-3 h-3 mr-1" />
                  Archivo {i + 1}
                </Badge>
              ))}
            </div>
          )}
          <span className="text-xs opacity-60 mt-1 block">
            {new Date(message.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Typing indicator
const TypingIndicator = () => (
  <div className="flex justify-start mb-3">
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
)

// Quick reply buttons
const QuickReplies = ({ options, onSelect }) => (
  <div className="flex flex-wrap gap-2 mb-3 px-2">
    {options.map((option, i) => (
      <Button
        key={i}
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => onSelect(option)}
      >
        {option}
      </Button>
    ))}
  </div>
)

// File upload preview
const FilePreview = ({ files, onRemove }) => (
  <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg mb-2">
    {files.map((file, i) => (
      <div key={i} className="flex items-center gap-1 bg-white rounded px-2 py-1 text-xs">
        {file.type.startsWith('image/') ? (
          <ImageIcon className="w-3 h-3 text-blue-500" />
        ) : file.name.match(/\.(stl|obj|3mf|step)$/i) ? (
          <Box className="w-3 h-3 text-purple-500" />
        ) : (
          <FileText className="w-3 h-3 text-gray-500" />
        )}
        <span className="max-w-[100px] truncate">{file.name}</span>
        <button onClick={() => onRemove(i)} className="text-red-500 hover:text-red-700">
          <X className="w-3 h-3" />
        </button>
      </div>
    ))}
  </div>
)

// Main Chatbot component
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [guestId, setGuestId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [files, setFiles] = useState([])
  const [currentState, setCurrentState] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Load existing session on mount
  useEffect(() => {
    const savedGuestId = localStorage.getItem('chatbot_guest_id')
    const savedSessionId = localStorage.getItem('chatbot_session_id')
    
    if (savedGuestId) {
      setGuestId(savedGuestId)
      // Try to resume session
      if (savedSessionId) {
        resumeSession(savedSessionId)
      }
    }
  }, [])

  // Start new chat session
  const startChat = async () => {
    setIsLoading(true)
    try {
      const existingGuestId = localStorage.getItem('chatbot_guest_id')
      
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: existingGuestId })
      })
      
      const data = await response.json()
      
      setSessionId(data.sessionId)
      setGuestId(data.guestId)
      setCurrentState(data.state)
      
      localStorage.setItem('chatbot_session_id', data.sessionId)
      localStorage.setItem('chatbot_guest_id', data.guestId)
      
      // Add greeting message
      setMessages([{
        id: Date.now(),
        role: 'bot',
        content: data.message,
        timestamp: new Date()
      }])
      
      setIsComplete(false)
    } catch (error) {
      console.error('Error starting chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Resume existing session
  const resumeSession = async (sessId) => {
    try {
      const response = await fetch(`/api/chat/session/${sessId}`)
      if (response.ok) {
        const session = await response.json()
        if (session && session.status === 'active') {
          setSessionId(session.id)
          setMessages(session.messages || [])
          setCurrentState(session.state)
          setIsComplete(session.state === 'COMPLETE')
        }
      }
    } catch (error) {
      console.error('Error resuming session:', error)
    }
  }

  // Send message
  const sendMessage = async (content = inputValue) => {
    if ((!content.trim() && files.length === 0) || isLoading || isComplete) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      fileUrls: files.map(f => f.name),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Upload files first if any
      let uploadedUrls = []
      if (files.length > 0) {
        for (const file of files) {
          const uploadResponse = await fetch('/api/chat/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            })
          })
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            uploadedUrls.push(uploadData.file.url)
          }
        }
        setFiles([])
      }

      // Send message to bot
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content.trim(),
          fileUrls: uploadedUrls
        })
      })

      const data = await response.json()

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

      setIsTyping(false)
      setCurrentState(data.state)
      setIsComplete(data.isComplete)

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])

      if (data.isComplete) {
        localStorage.removeItem('chatbot_session_id')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(file => {
      const ext = file.name.toLowerCase()
      const isValid = ext.match(/\.(stl|obj|3mf|step|stp|jpg|jpeg|png|gif|webp|pdf)$/)
      const isSmallEnough = file.size <= 50 * 1024 * 1024
      return isValid && isSmallEnough
    })
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
    e.target.value = '' // Reset input
  }

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Reset chat
  const resetChat = () => {
    localStorage.removeItem('chatbot_session_id')
    setSessionId(null)
    setMessages([])
    setCurrentState(null)
    setIsComplete(false)
    setFiles([])
    startChat()
  }

  // Get quick reply options based on state
  const getQuickReplies = () => {
    switch (currentState) {
      case 'INTENT_DETECTION':
        return ['A) Tengo archivo 3D', 'B) Diseñar desde cero', 'C) Duplicar pieza', 'D) Reparar pieza']
      case 'FILE_CHECK':
        return ['Sí, lo tengo', 'No, necesito diseño']
      case 'USAGE':
        return ['Decorativo interior', 'Funcional interior', 'Uso exterior', 'Alta resistencia']
      case 'MATERIAL':
        return ['PLA', 'PETG', 'ABS', 'TPU', 'Resina', 'No sé']
      case 'FINISH':
        return ['Estándar', 'Lijado', 'Pintado', 'Alta calidad']
      case 'DEADLINE':
        return ['Urgente', 'Normal (5-7 días)', 'Flexible']
      case 'DELIVERY':
        return ['Retiro en taller', 'Envío a domicilio']
      case 'SUMMARY':
        return ['Confirmar', 'Corregir algo']
      default:
        return []
    }
  }

  // Toggle chat
  const toggleChat = () => {
    if (!isOpen && !sessionId) {
      startChat()
    }
    setIsOpen(!isOpen)
  }

  // Container classes based on state
  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50'
    : 'fixed bottom-4 right-4 z-50 w-full max-w-md'

  const chatClasses = isFullscreen
    ? 'w-full h-full rounded-none'
    : 'rounded-2xl shadow-2xl'

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 group"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Cotiza tu proyecto 3D
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={containerClasses}>
          <Card className={`flex flex-col overflow-hidden border-0 ${chatClasses} ${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
            {/* Header */}
            <CardHeader className="flex-shrink-0 bg-primary text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Asistente PrintStudios</CardTitle>
                    <p className="text-xs text-white/80">Cotiza tu proyecto 3D</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={resetChat}
                    title="Nueva conversación"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hidden sm:flex"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isBot={msg.role === 'bot'}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick replies */}
            {!isComplete && getQuickReplies().length > 0 && !isTyping && (
              <QuickReplies 
                options={getQuickReplies()} 
                onSelect={(option) => sendMessage(option)}
              />
            )}

            {/* Completion message */}
            {isComplete && (
              <div className="p-4 bg-green-50 border-t">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">¡Solicitud enviada correctamente!</span>
                </div>
              </div>
            )}

            {/* Input area */}
            {!isComplete && (
              <div className="flex-shrink-0 border-t p-3 bg-white">
                {files.length > 0 && (
                  <FilePreview files={files} onRemove={removeFile} />
                )}
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".stl,.obj,.3mf,.step,.stp,.jpg,.jpeg,.png,.gif,.webp,.pdf"
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || (!inputValue.trim() && files.length === 0)}
                    className="flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* New chat button after completion */}
            {isComplete && (
              <div className="p-4 border-t">
                <Button onClick={resetChat} className="w-full">
                  Iniciar nueva cotización
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
