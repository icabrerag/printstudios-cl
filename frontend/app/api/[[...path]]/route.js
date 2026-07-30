import { NextResponse } from 'next/server'

function getApiUrl() {
  const configured = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  if (configured) return configured.replace(/\/$/, '')

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8005'
  }

  throw new Error('INTERNAL_API_URL or NEXT_PUBLIC_API_URL is required in production')
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    },
  })
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`

  try {
    const apiUrl = getApiUrl()
    const target = `${apiUrl}${route}${request.nextUrl.search}`
    const headers = new Headers()
    const forwardedHeaders = [
      'accept',
      'authorization',
      'content-type',
      'cookie',
    ]

    forwardedHeaders.forEach((headerName) => {
      const value = request.headers.get(headerName)
      if (value) headers.set(headerName, value)
    })

    const init = {
      method: request.method,
      headers,
      redirect: 'manual',
      cache: 'no-store',
    }

    if (!['GET', 'HEAD'].includes(request.method)) {
      init.body = await request.text()
    }

    const response = await fetch(target, init)
    const body = await response.text()
    const responseHeaders = new Headers()
    const contentType = response.headers.get('content-type')
    const setCookie = response.headers.get('set-cookie')

    if (contentType) responseHeaders.set('content-type', contentType)
    if (setCookie) responseHeaders.set('set-cookie', setCookie)

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Backend no disponible',
      detail: error.message,
    }, { status: 503 })
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
