# Modulo de cursos online

## Objetivo

Agregar una plataforma educativa para PrintStudios sin mezclar la logica de cursos con la landing, cotizaciones o chatbot.

## Rutas frontend

- `/cursos`: pagina publica con introduccion gratuita y catalogo.
- `/cursos/[id]`: detalle publico del curso, modulos, previews y compra simulada.
- `/registro`: registro de alumnos.
- `/login`: login de alumnos y admin mediante el mismo endpoint.
- `/recuperar-password`: solicitud de recuperacion y cambio de password con token.
- `/mis-cursos`: cursos comprados o inscritos por el alumno.
- `/mis-cursos/[id]`: vista de aprendizaje, lecciones y progreso.
- `/certificados/[code]`: certificado publico verificable e imprimible.
- `/admin`: panel con gestion de cursos, cola de emails y certificados.

## Tablas MySQL

- `users`: alumnos.
- `courses`: cursos publicados.
- `course_modules`: modulos por curso.
- `lessons`: lecciones por modulo.
- `enrollments`: cursos comprados/inscritos por usuario.
- `payments`: pagos simulados, preparados para proveedor real.
- `lesson_progress`: progreso por leccion.
- `password_reset_tokens`: tokens de recuperacion de password con expiracion y uso unico.
- `email_notifications`: cola/auditoria de emails transaccionales, con estado `queued`, `sent` o `failed`.
- `certificates`: certificados emitidos al completar cursos.

## Endpoints FastAPI

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/student/me`
- `GET /courses`
- `GET /courses/{course_id}`
- `GET /courses/{course_id}/lessons/{lesson_id}`
- `POST /courses/{course_id}/purchase`
- `GET /me/courses`
- `GET /me/courses/{course_id}`
- `GET /me/certificates`
- `POST /me/courses/{course_id}/certificate`
- `GET /certificates/{certificate_code}`
- `POST /lessons/{lesson_id}/progress`
- `GET /admin/courses`
- `POST /admin/courses`
- `PUT /admin/courses/{course_id}`
- `DELETE /admin/courses/{course_id}`
- `GET /admin/courses/{course_id}`
- `POST /admin/courses/{course_id}/modules`
- `POST /admin/courses/{course_id}/modules/{module_id}/lessons`
- `DELETE /admin/lessons/{lesson_id}`
- `GET /admin/email-notifications`
- `POST /admin/email-notifications/{notification_id}/send`
- `GET /admin/certificates`

## Reglas de acceso

- Las lecciones con `is_free_preview=true` se pueden ver sin comprar.
- Las lecciones pagadas devuelven `isLocked=true` y no exponen `content` si el usuario no compro el curso.
- La compra simulada crea un registro en `payments` y una inscripcion en `enrollments`.
- El progreso se calcula usando lecciones completadas sobre el total de lecciones del curso.
- Al llegar a 100% se emite un certificado si todavia no existe.
- Los emails se registran siempre en MySQL. Si `EMAIL_SEND_ENABLED=true`, el backend intenta enviarlos por `EMAIL_PROVIDER=smtp` o `EMAIL_PROVIDER=resend`; si no, quedan en `queued`.
- El admin puede reintentar correos no enviados desde el panel o con `POST /admin/email-notifications/{id}/send`.
- El admin puede ver y editar cursos publicados o borradores.

## Siguientes integraciones

- Pasarela de pago: WebPay, MercadoPago o Stripe.
- Video: Cloudflare R2, S3, Vimeo o YouTube privado.
- Configurar DNS del dominio para email real: SPF, DKIM y DMARC segun el proveedor elegido.
- Admin avanzado: editar/borrar modulos, ordenar contenido y subir assets.
- Certificados descargables en PDF con firma/logo.
- Cupones, bundles, membresias y venta cruzada con productos PrintStudios.

## Configuracion de email real

SMTP:

```env
EMAIL_SEND_ENABLED=true
EMAIL_PROVIDER=smtp
EMAIL_FROM=PrintStudios <cursos@printstudios.cl>
SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=password-o-api-key
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

Resend:

```env
EMAIL_SEND_ENABLED=true
EMAIL_PROVIDER=resend
EMAIL_FROM=PrintStudios <cursos@printstudios.cl>
RESEND_API_KEY=re_xxx
```

Para produccion, usar un correo del dominio `printstudios.cl` y validar SPF/DKIM antes de activar envio masivo.
