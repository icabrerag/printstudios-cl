# PrintStudios - arquitectura objetivo

## Estado actual

El proyecto queda ordenado como base monorepo simple:

- `frontend/`: landing Next.js en puerto `3005`.
- `backend/`: API FastAPI en puerto interno `8000`, expuesta por Docker en `8005`.
- `docker-compose.yml`: servicios `frontend`, `backend` y `db`.
- `frontend/public/assets/instagram/`: carpeta preparada para fotos o videos autorizados de PrintStudios.

## Frontend Next.js

La landing usa datos locales en `frontend/lib/landingData.js` y consulta `/api/services` y `/api/portfolio`. La API interna de Next intenta proxy hacia `NEXT_PUBLIC_API_URL`; si el backend no esta levantado, responde con datos locales para que la landing siga funcionando.

Estructura recomendada para crecer:

- `app/`: rutas publicas y admin.
- `components/landing/`: secciones de landing reutilizables.
- `components/admin/`: panel interno.
- `lib/landingData.js`: datos semilla o fallback.
- `lib/apiClient.js`: cliente unico para backend.
- `public/assets/instagram/`: assets autorizados de la marca.

## Backend FastAPI

El backend actual expone:

- `GET /health`
- `GET /services`
- `GET /portfolio`
- `POST /quotes`
- `GET /quotes/{quote_id}`

Siguiente paso recomendado: mover datos en memoria a modelos SQLAlchemy + migraciones Alembic sobre MySQL.

## MySQL

Tablas iniciales sugeridas para cotizaciones y catalogo:

- `services`: servicios ofrecidos.
- `portfolio_items`: trabajos destacados.
- `quote_requests`: solicitudes de cotizacion.
- `quote_files`: metadatos de archivos asociados.
- `users`: usuarios admin.

Para ecommerce propio:

- `products`
- `product_variants`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `customers`

## Docker y puertos

- Frontend local: `http://localhost:3005`
- Backend local: `http://localhost:8005`
- MySQL local: `localhost:3307`

## Variables de entorno

Ver `.env.example`. No usar variables `MONGO_URL` ni `DB_NAME`; pertenecian al template anterior y no calzan con el stack objetivo.

## Integracion con Instagram

No descargar ni reutilizar imagenes del Instagram sin permiso. Si Ignacio confirma que son assets propios autorizados, subir manualmente a:

`frontend/public/assets/instagram/`

Nombres sugeridos:

- `hero-taller.jpg`
- `galeria-figuras-01.jpg`
- `galeria-piezas-funcionales-01.jpg`
- `proceso-impresora-01.jpg`
- `curso-impresion-3d-01.jpg`
