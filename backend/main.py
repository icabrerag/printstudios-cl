import os
import re
import smtplib
import ssl
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from email.message import EmailMessage
from typing import Any
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from db import Base, SessionLocal, engine, get_db
from models import (
    AdminUser,
    BotRequest,
    Certificate,
    ChatSession,
    Course,
    CourseModule,
    EmailNotification,
    Enrollment,
    Lesson,
    LessonProgress,
    Message,
    Payment,
    PasswordResetToken,
    PortfolioItem,
    Quote,
    Service,
    User,
)
from seed_data import DEFAULT_COURSES, DEFAULT_PORTFOLIO, DEFAULT_SERVICES

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(
    title="PrintStudios API",
    version="0.2.0",
    description="Backend real para landing, cotizaciones, chatbot y admin.",
)

def get_cors_origins() -> list[str]:
    configured = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
    if ENVIRONMENT in {"development", "local", "test"}:
        local_origins = ["http://localhost:3000", "http://localhost:3005"]
        return list(dict.fromkeys([*configured, *local_origins]))
    return configured


origins = get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ServiceIn(BaseModel):
    title: str
    description: str
    basePrice: int = 0
    category: str = "3d"
    image: str = ""
    features: list[str] = Field(default_factory=list)
    active: bool = True


class PortfolioIn(BaseModel):
    title: str
    category: str
    image: str
    description: str | None = None


class QuoteIn(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    serviceId: str
    material: str | None = None
    color: str | None = None
    size: str | None = None
    quantity: int = 1
    notes: str | None = None
    estimatedPrice: int | None = 0
    estimatedDays: int | None = None
    fileName: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class PurchaseIn(BaseModel):
    provider: str = "simulated"


class LessonProgressIn(BaseModel):
    completed: bool = True


class PasswordForgotIn(BaseModel):
    email: EmailStr


class PasswordResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6)


class CourseAdminIn(BaseModel):
    title: str
    slug: str | None = None
    description: str
    intro: str
    level: str = "principiante"
    price: int = 0
    image: str = ""
    duration: str = "1 hora"
    tags: list[str] = Field(default_factory=list)
    isPublished: bool = True


class ModuleAdminIn(BaseModel):
    title: str
    description: str | None = None
    sortOrder: int = 1


class LessonAdminIn(BaseModel):
    title: str
    description: str | None = None
    content: str
    videoUrl: str | None = None
    duration: str = "10 min"
    sortOrder: int = 1
    isFreePreview: bool = False


class ChatStartIn(BaseModel):
    guestId: str | None = None


class ChatMessageIn(BaseModel):
    sessionId: str
    message: str = ""
    fileUrls: list[str] = Field(default_factory=list)


class ChatUploadIn(BaseModel):
    sessionId: str | None = None
    fileName: str
    fileType: str | None = None
    fileSize: int = 0


class MessageIn(BaseModel):
    name: str | None = None
    email: EmailStr
    message: str
    quoteId: str | None = None


def dt(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def service_out(service: Service) -> dict[str, Any]:
    return {
        "id": service.id,
        "title": service.title,
        "description": service.description,
        "basePrice": service.base_price,
        "category": service.category,
        "image": service.image,
        "features": service.features or [],
        "active": service.active,
        "createdAt": dt(service.created_at),
        "updatedAt": dt(service.updated_at),
    }


def portfolio_out(item: PortfolioItem) -> dict[str, Any]:
    return {
        "id": item.id,
        "title": item.title,
        "category": item.category,
        "image": item.image,
        "description": item.description,
        "createdAt": dt(item.created_at),
    }


def quote_out(quote: Quote) -> dict[str, Any]:
    return {
        "id": quote.id,
        "sourceRequestId": quote.source_request_id,
        "source": quote.source,
        "name": quote.name,
        "email": quote.email,
        "phone": quote.phone,
        "serviceId": quote.service_id,
        "material": quote.material,
        "color": quote.color,
        "size": quote.size,
        "quantity": quote.quantity,
        "notes": quote.notes,
        "fileName": quote.file_name,
        "estimatedPrice": quote.estimated_price,
        "estimatedDays": quote.estimated_days,
        "status": quote.status,
        "requirements": quote.requirements,
        "attachments": quote.attachments or [],
        "adminNotes": quote.admin_notes,
        "createdAt": dt(quote.created_at),
        "updatedAt": dt(quote.updated_at),
    }


def bot_request_out(request: BotRequest) -> dict[str, Any]:
    return {
        "id": request.id,
        "sessionId": request.session_id,
        "guestId": request.guest_id,
        "intentType": request.intent_type,
        "requirements": request.requirements or {},
        "attachments": request.attachments or [],
        "contact": request.contact or {},
        "summary": request.summary or {},
        "status": request.status,
        "isComplete": request.is_complete,
        "missingInfo": request.missing_info or [],
        "quoteId": request.quote_id,
        "adminMessages": request.admin_messages or [],
        "createdAt": dt(request.created_at),
        "updatedAt": dt(request.updated_at),
    }


def message_out(message: Message) -> dict[str, Any]:
    return {
        "id": message.id,
        "name": message.name,
        "email": message.email,
        "message": message.message,
        "quoteId": message.quote_id,
        "read": message.read,
        "createdAt": dt(message.created_at),
    }


def course_out(course: Course, enrollment: Enrollment | None = None) -> dict[str, Any]:
    return {
        "id": course.id,
        "slug": course.slug,
        "title": course.title,
        "description": course.description,
        "intro": course.intro,
        "level": course.level,
        "price": course.price,
        "image": course.image,
        "duration": course.duration,
        "lessonCount": course.lesson_count,
        "tags": course.tags or [],
        "isPublished": course.is_published,
        "isFree": course.price == 0,
        "isEnrolled": enrollment is not None,
        "progress": enrollment.progress if enrollment else 0,
        "createdAt": dt(course.created_at),
    }


def module_out(module: CourseModule, lessons: list[Lesson], completed: set[str], can_access_paid: bool) -> dict[str, Any]:
    return {
        "id": module.id,
        "title": module.title,
        "description": module.description,
        "sortOrder": module.sort_order,
        "lessons": [
            {
                "id": lesson.id,
                "title": lesson.title,
                "description": lesson.description,
                "duration": lesson.duration,
                "sortOrder": lesson.sort_order,
                "isFreePreview": lesson.is_free_preview,
                "isLocked": not (can_access_paid or lesson.is_free_preview),
                "isCompleted": lesson.id in completed,
            }
            for lesson in lessons
        ],
    }


def lesson_out(lesson: Lesson, is_completed: bool, can_access: bool) -> dict[str, Any]:
    return {
        "id": lesson.id,
        "courseId": lesson.course_id,
        "moduleId": lesson.module_id,
        "title": lesson.title,
        "description": lesson.description,
        "content": lesson.content if can_access else None,
        "videoUrl": lesson.video_url if can_access else None,
        "duration": lesson.duration,
        "isFreePreview": lesson.is_free_preview,
        "isLocked": not can_access,
        "isCompleted": is_completed,
    }


def certificate_out(certificate: Certificate, course: Course | None = None, user: User | None = None) -> dict[str, Any]:
    return {
        "id": certificate.id,
        "courseId": certificate.course_id,
        "courseTitle": course.title if course else None,
        "studentName": user.name if user else None,
        "certificateCode": certificate.certificate_code,
        "issuedAt": dt(certificate.issued_at),
    }


def email_out(notification: EmailNotification) -> dict[str, Any]:
    return {
        "id": notification.id,
        "recipient": notification.recipient,
        "subject": notification.subject,
        "body": notification.body,
        "eventType": notification.event_type,
        "status": notification.status,
        "provider": notification.provider,
        "createdAt": dt(notification.created_at),
        "sentAt": dt(notification.sent_at),
    }


def email_enabled() -> bool:
    return os.getenv("EMAIL_SEND_ENABLED", "false").lower() in {"1", "true", "yes", "on"}


def send_smtp_email(recipient: str, subject: str, body: str) -> None:
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("EMAIL_FROM") or username
    if not host or not sender:
        raise RuntimeError("SMTP_HOST y EMAIL_FROM/SMTP_USERNAME son requeridos")

    port = int(os.getenv("SMTP_PORT", "587"))
    use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() in {"1", "true", "yes", "on"}
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes", "on"}

    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    if use_ssl:
        with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=20) as smtp:
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            if use_tls:
                smtp.starttls(context=ssl.create_default_context())
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)


def send_resend_email(recipient: str, subject: str, body: str) -> None:
    import json

    api_key = os.getenv("RESEND_API_KEY")
    sender = os.getenv("EMAIL_FROM")
    if not api_key or not sender:
        raise RuntimeError("RESEND_API_KEY y EMAIL_FROM son requeridos")

    payload = json.dumps({"from": sender, "to": [recipient], "subject": subject, "text": body}).encode("utf-8")
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status >= 400:
            raise RuntimeError(f"Resend respondio con estado {response.status}")


def deliver_email(notification: EmailNotification) -> EmailNotification:
    provider = os.getenv("EMAIL_PROVIDER", "mock").lower()
    notification.provider = provider

    if not email_enabled() or provider == "mock":
        notification.status = "queued"
        return notification

    try:
        if provider == "smtp":
            send_smtp_email(notification.recipient, notification.subject, notification.body)
        elif provider == "resend":
            send_resend_email(notification.recipient, notification.subject, notification.body)
        else:
            raise RuntimeError(f"Proveedor de email no soportado: {provider}")
        notification.status = "sent"
        notification.sent_at = datetime.utcnow()
    except (RuntimeError, OSError, smtplib.SMTPException, urllib.error.URLError) as exc:
        notification.status = "failed"
        notification.provider = f"{provider}: {str(exc)[:60]}"
    return notification


def create_token(user: AdminUser | User, account_type: str = "admin") -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "type": account_type,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> AdminUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token invalido") from exc
    user = db.get(AdminUser, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def current_student(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Token invalido") from exc
    if payload.get("type") != "student":
        raise HTTPException(status_code=403, detail="Cuenta de alumno requerida")
    user = db.get(User, payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def optional_student(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
    if payload.get("type") != "student":
        return None
    return db.get(User, payload.get("sub"))


def seed_database(db: Session) -> None:
    if not db.execute(select(Service).limit(1)).scalar_one_or_none():
        db.add_all([Service(**item) for item in DEFAULT_SERVICES])
    if not db.execute(select(PortfolioItem).limit(1)).scalar_one_or_none():
        db.add_all([PortfolioItem(**item) for item in DEFAULT_PORTFOLIO])
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Administrador")
    if admin_email and admin_password and not db.execute(select(AdminUser).where(AdminUser.email == admin_email)).scalar_one_or_none():
        db.add(
            AdminUser(
                id=str(uuid4()),
                email=admin_email,
                password_hash=pwd_context.hash(admin_password),
                name=admin_name,
                role="admin",
            )
        )
    if not db.execute(select(Course).limit(1)).scalar_one_or_none():
        for item in DEFAULT_COURSES:
            course = Course(**item["course"])
            db.add(course)
            for module_index, module_data in enumerate(item["modules"], start=1):
                lessons_data = module_data["lessons"]
                module = CourseModule(
                    id=str(uuid4()),
                    course_id=course.id,
                    title=module_data["title"],
                    description=module_data.get("description"),
                    sort_order=module_index,
                )
                db.add(module)
                for lesson_index, lesson_data in enumerate(lessons_data, start=1):
                    db.add(
                        Lesson(
                            id=str(uuid4()),
                            course_id=course.id,
                            module_id=module.id,
                            sort_order=lesson_index,
                            **lesson_data,
                        )
                    )
    for course in db.execute(select(Course)).scalars().all():
        course.lesson_count = db.scalar(select(func.count()).select_from(Lesson).where(Lesson.course_id == course.id)) or course.lesson_count
    db.commit()


def queue_email(db: Session, recipient: str, subject: str, body: str, event_type: str) -> EmailNotification:
    notification = EmailNotification(
        id=str(uuid4()),
        recipient=recipient,
        subject=subject,
        body=body,
        event_type=event_type,
        status="queued",
        provider=os.getenv("EMAIL_PROVIDER", "mock"),
    )
    db.add(notification)
    db.flush()
    deliver_email(notification)
    return notification


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)


@app.get("/")
def root():
    return {"message": "PrintStudios API funcionando", "version": app.version}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(select(1))
    return {"status": "ok"}


@app.get("/services")
def list_services(db: Session = Depends(get_db)):
    rows = db.execute(select(Service).where(Service.active == True).order_by(Service.created_at)).scalars().all()
    return [service_out(row) for row in rows]


@app.get("/portfolio")
def list_portfolio(db: Session = Depends(get_db)):
    rows = db.execute(select(PortfolioItem).order_by(PortfolioItem.created_at)).scalars().all()
    return [portfolio_out(row) for row in rows]


@app.get("/courses")
def list_courses(user: User | None = Depends(optional_student), db: Session = Depends(get_db)):
    courses = db.execute(select(Course).where(Course.is_published == True).order_by(Course.created_at)).scalars().all()
    enrollments = {}
    if user:
        rows = db.execute(select(Enrollment).where(Enrollment.user_id == user.id)).scalars().all()
        enrollments = {row.course_id: row for row in rows}
    return [course_out(course, enrollments.get(course.id)) for course in courses]


@app.get("/courses/{course_id}")
def get_course(course_id: str, user: User | None = Depends(optional_student), db: Session = Depends(get_db)):
    course = get_course_by_id_or_slug(db, course_id)
    enrollment = get_enrollment(db, user.id, course.id) if user else None
    completed = get_completed_lesson_ids(db, user.id, course.id) if user else set()
    modules = get_course_modules_payload(db, course.id, completed, can_access_paid=course.price == 0 or enrollment is not None)
    return {**course_out(course, enrollment), "modules": modules}


@app.get("/courses/{course_id}/lessons/{lesson_id}")
def get_course_lesson(course_id: str, lesson_id: str, user: User | None = Depends(optional_student), db: Session = Depends(get_db)):
    course = get_course_by_id_or_slug(db, course_id)
    lesson = db.get(Lesson, lesson_id)
    if not lesson or lesson.course_id != course.id:
        raise HTTPException(status_code=404, detail="Leccion no encontrada")
    enrollment = get_enrollment(db, user.id, course.id) if user else None
    can_access = course.price == 0 or lesson.is_free_preview or enrollment is not None
    progress = get_lesson_progress(db, user.id, lesson.id) if user else None
    if not can_access:
        return lesson_out(lesson, bool(progress and progress.completed), False)
    return lesson_out(lesson, bool(progress and progress.completed), True)


@app.post("/courses/{course_id}/purchase")
def purchase_course(course_id: str, payload: PurchaseIn, user: User = Depends(current_student), db: Session = Depends(get_db)):
    course = get_course_by_id_or_slug(db, course_id)
    enrollment = get_enrollment(db, user.id, course.id)
    if not enrollment:
        db.add(
            Payment(
                id=str(uuid4()),
                user_id=user.id,
                course_id=course.id,
                amount=course.price,
                provider=payload.provider,
                status="paid",
                external_id=f"SIM-{uuid4().hex[:10]}",
            )
        )
        enrollment = Enrollment(id=str(uuid4()), user_id=user.id, course_id=course.id, status="active", progress=0)
        db.add(enrollment)
        queue_email(
            db,
            user.email,
            f"Compra confirmada: {course.title}",
            f"Tu acceso al curso {course.title} ya esta activo en PrintStudios Cursos.",
            "course_purchase",
        )
        db.commit()
    return {"success": True, "enrollment": {"courseId": course.id, "status": enrollment.status, "progress": enrollment.progress}}


@app.get("/me/courses")
def my_courses(user: User = Depends(current_student), db: Session = Depends(get_db)):
    enrollments = db.execute(select(Enrollment).where(Enrollment.user_id == user.id).order_by(Enrollment.created_at.desc())).scalars().all()
    courses = []
    for enrollment in enrollments:
        course = db.get(Course, enrollment.course_id)
        if course:
            courses.append(course_out(course, enrollment))
    return courses


@app.get("/me/courses/{course_id}")
def my_course_detail(course_id: str, user: User = Depends(current_student), db: Session = Depends(get_db)):
    course = get_course_by_id_or_slug(db, course_id)
    enrollment = get_enrollment(db, user.id, course.id)
    if not enrollment and course.price > 0:
        raise HTTPException(status_code=403, detail="Debes comprar el curso para acceder")
    if not enrollment and course.price == 0:
        enrollment = Enrollment(id=str(uuid4()), user_id=user.id, course_id=course.id, status="active", progress=0)
        db.add(enrollment)
        db.commit()
    completed = get_completed_lesson_ids(db, user.id, course.id)
    modules = get_course_modules_payload(db, course.id, completed, can_access_paid=True)
    return {**course_out(course, enrollment), "modules": modules}


@app.post("/lessons/{lesson_id}/progress")
def update_lesson_progress(lesson_id: str, payload: LessonProgressIn, user: User = Depends(current_student), db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Leccion no encontrada")
    course = db.get(Course, lesson.course_id)
    enrollment = get_enrollment(db, user.id, lesson.course_id)
    if not enrollment and course and course.price > 0 and not lesson.is_free_preview:
        raise HTTPException(status_code=403, detail="Debes comprar el curso para marcar progreso")
    if not enrollment:
        enrollment = Enrollment(id=str(uuid4()), user_id=user.id, course_id=lesson.course_id, status="active", progress=0)
        db.add(enrollment)
        db.flush()
    progress = get_lesson_progress(db, user.id, lesson.id)
    if not progress:
        progress = LessonProgress(id=str(uuid4()), user_id=user.id, course_id=lesson.course_id, lesson_id=lesson.id)
        db.add(progress)
    progress.completed = payload.completed
    progress.completed_at = datetime.utcnow() if payload.completed else None
    db.flush()
    enrollment.progress = calculate_course_progress(db, user.id, lesson.course_id)
    enrollment.updated_at = datetime.utcnow()
    if enrollment.progress >= 100:
        ensure_certificate(db, user, lesson.course_id)
    db.commit()
    return {"success": True, "lessonId": lesson.id, "completed": progress.completed, "courseProgress": enrollment.progress}


@app.get("/me/certificates")
def my_certificates(user: User = Depends(current_student), db: Session = Depends(get_db)):
    rows = db.execute(select(Certificate).where(Certificate.user_id == user.id).order_by(Certificate.issued_at.desc())).scalars().all()
    return [certificate_out(row, db.get(Course, row.course_id), user) for row in rows]


@app.post("/me/courses/{course_id}/certificate")
def issue_my_certificate(course_id: str, user: User = Depends(current_student), db: Session = Depends(get_db)):
    course = get_course_by_id_or_slug(db, course_id)
    enrollment = get_enrollment(db, user.id, course.id)
    if not enrollment or enrollment.progress < 100:
        raise HTTPException(status_code=400, detail="Debes completar el curso para emitir certificado")
    certificate = ensure_certificate(db, user, course.id)
    db.commit()
    return certificate_out(certificate, course, user)


@app.get("/certificates/{certificate_code}")
def public_certificate(certificate_code: str, db: Session = Depends(get_db)):
    certificate = db.execute(select(Certificate).where(Certificate.certificate_code == certificate_code)).scalar_one_or_none()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return certificate_out(certificate, db.get(Course, certificate.course_id), db.get(User, certificate.user_id))


@app.post("/quotes")
def create_quote(payload: QuoteIn, db: Session = Depends(get_db)):
    quote = Quote(
        id=str(uuid4()),
        source="landing",
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        service_id=payload.serviceId,
        material=payload.material,
        color=payload.color,
        size=payload.size,
        quantity=payload.quantity,
        notes=payload.notes,
        file_name=payload.fileName,
        estimated_price=payload.estimatedPrice or 0,
        estimated_days=payload.estimatedDays,
        status="pending",
    )
    db.add(quote)
    db.commit()
    return {"success": True, "quoteId": quote.id}


@app.get("/quotes/{quote_id}")
def get_quote(quote_id: str, db: Session = Depends(get_db)):
    quote = db.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Cotizacion no encontrada")
    return quote_out(quote)


@app.post("/auth/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    email = str(payload.email)
    user = db.execute(select(AdminUser).where(AdminUser.email == email)).scalar_one_or_none()
    if user and pwd_context.verify(payload.password, user.password_hash):
        return {
            "token": create_token(user, "admin"),
            "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "type": "admin"},
        }

    student = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if student and pwd_context.verify(payload.password, student.password_hash):
        return {
            "token": create_token(student, "student"),
            "user": {"id": student.id, "email": student.email, "name": student.name, "role": student.role, "type": "student"},
        }
    raise HTTPException(status_code=401, detail="Credenciales invalidas")


@app.post("/auth/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    email = str(payload.email)
    exists = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    admin_exists = db.execute(select(AdminUser).where(AdminUser.email == email)).scalar_one_or_none()
    if exists or admin_exists:
        raise HTTPException(status_code=409, detail="El email ya esta registrado")
    user = User(
        id=str(uuid4()),
        name=payload.name.strip(),
        email=email,
        password_hash=pwd_context.hash(payload.password),
        role="student",
    )
    db.add(user)
    queue_email(
        db,
        user.email,
        "Bienvenido a PrintStudios Cursos",
        "Tu cuenta fue creada correctamente. Ya puedes acceder a previews, comprar cursos y guardar tu progreso.",
        "student_welcome",
    )
    db.commit()
    return {
        "token": create_token(user, "student"),
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "type": "student"},
    }


@app.post("/auth/forgot-password")
def forgot_password(payload: PasswordForgotIn, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == str(payload.email))).scalar_one_or_none()
    if user:
        token = uuid4().hex
        db.add(
            PasswordResetToken(
                id=str(uuid4()),
                user_id=user.id,
                token=token,
                expires_at=datetime.utcnow() + timedelta(hours=2),
            )
        )
        reset_url = f"{os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3005')}/recuperar-password?token={token}"
        queue_email(
            db,
            user.email,
            "Recupera tu password de PrintStudios Cursos",
            f"Usa este link para crear un nuevo password: {reset_url}",
            "password_reset",
        )
        db.commit()
    return {"success": True, "message": "Si el email existe, se genero una notificacion de recuperacion"}


@app.post("/auth/reset-password")
def reset_password(payload: PasswordResetIn, db: Session = Depends(get_db)):
    reset = db.execute(select(PasswordResetToken).where(PasswordResetToken.token == payload.token)).scalar_one_or_none()
    if not reset or reset.used_at or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token invalido o expirado")
    user = db.get(User, reset.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.password_hash = pwd_context.hash(payload.password)
    user.updated_at = datetime.utcnow()
    reset.used_at = datetime.utcnow()
    queue_email(db, user.email, "Password actualizado", "Tu password fue actualizado correctamente.", "password_changed")
    db.commit()
    return {"success": True}


@app.get("/auth/me")
def me(user: AdminUser = Depends(current_user)):
    return {"id": user.id, "email": user.email, "role": user.role, "type": "admin"}


@app.get("/auth/student/me")
def student_me(user: User = Depends(current_student)):
    return {"id": user.id, "email": user.email, "name": user.name, "role": user.role, "type": "student"}


@app.get("/admin/dashboard")
def admin_dashboard(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    quotes = db.execute(select(Quote).order_by(Quote.created_at.desc()).limit(5)).scalars().all()
    bot_requests = db.execute(select(BotRequest).order_by(BotRequest.created_at.desc()).limit(5)).scalars().all()
    total_revenue = db.execute(select(func.coalesce(func.sum(Quote.estimated_price), 0)).where(Quote.status == "completed")).scalar_one()
    return {
        "stats": {
            "totalQuotes": db.scalar(select(func.count()).select_from(Quote)),
            "pendingQuotes": db.scalar(select(func.count()).select_from(Quote).where(Quote.status == "pending")),
            "approvedQuotes": db.scalar(select(func.count()).select_from(Quote).where(Quote.status == "approved")),
            "completedOrders": db.scalar(select(func.count()).select_from(Quote).where(Quote.status == "completed")),
            "totalRevenue": int(total_revenue or 0),
            "totalBotRequests": db.scalar(select(func.count()).select_from(BotRequest)),
            "newBotRequests": db.scalar(select(func.count()).select_from(BotRequest).where(BotRequest.status == "NEW")),
        },
        "recentQuotes": [quote_out(row) for row in quotes],
        "recentBotRequests": [bot_request_out(row) for row in bot_requests],
    }


@app.get("/admin/quotes")
def admin_quotes(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Quote).order_by(Quote.created_at.desc())).scalars().all()
    return [quote_out(row) for row in rows]


@app.put("/admin/quotes/{quote_id}")
async def update_quote(quote_id: str, request: Request, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    quote = db.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Cotizacion no encontrada")
    body = await request.json()
    for key, attr in {"status": "status", "estimatedPrice": "estimated_price", "estimatedDays": "estimated_days", "adminNotes": "admin_notes"}.items():
        if key in body:
            setattr(quote, attr, body[key])
    quote.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Cotizacion actualizada"}


@app.get("/admin/services")
def admin_services(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Service).order_by(Service.created_at)).scalars().all()
    return [service_out(row) for row in rows]


@app.post("/admin/services")
def create_service(payload: ServiceIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    service = Service(
        id=slugify(payload.title),
        title=payload.title,
        description=payload.description,
        base_price=payload.basePrice,
        category=payload.category,
        image=payload.image,
        features=payload.features,
        active=payload.active,
    )
    if db.get(Service, service.id):
        service.id = f"{service.id}-{uuid4().hex[:6]}"
    db.add(service)
    db.commit()
    return {"success": True, "service": service_out(service)}


@app.put("/admin/services/{service_id}")
def update_service(service_id: str, payload: ServiceIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    service.title = payload.title
    service.description = payload.description
    service.base_price = payload.basePrice
    service.category = payload.category
    service.image = payload.image
    service.features = payload.features
    service.active = payload.active
    service.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "service": service_out(service)}


@app.delete("/admin/services/{service_id}")
def delete_service(service_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    service = db.get(Service, service_id)
    if service:
        db.delete(service)
        db.commit()
    return {"success": True}


@app.get("/admin/portfolio")
def admin_portfolio(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(PortfolioItem).order_by(PortfolioItem.created_at)).scalars().all()
    return [portfolio_out(row) for row in rows]


@app.post("/admin/portfolio")
def create_portfolio(payload: PortfolioIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    item = PortfolioItem(id=f"{slugify(payload.title)}-{uuid4().hex[:6]}", **payload.model_dump())
    db.add(item)
    db.commit()
    return {"success": True, "item": portfolio_out(item)}


@app.delete("/admin/portfolio/{item_id}")
def delete_portfolio(item_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    item = db.get(PortfolioItem, item_id)
    if item:
        db.delete(item)
        db.commit()
    return {"success": True}


@app.post("/messages")
def create_message(payload: MessageIn, db: Session = Depends(get_db)):
    message = Message(id=str(uuid4()), name=payload.name, email=str(payload.email), message=payload.message, quote_id=payload.quoteId)
    db.add(message)
    db.commit()
    return {"success": True}


@app.get("/admin/messages")
def admin_messages(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Message).order_by(Message.created_at.desc())).scalars().all()
    return [message_out(row) for row in rows]


@app.put("/admin/messages/{message_id}")
def mark_message_read(message_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    message = db.get(Message, message_id)
    if message:
        message.read = True
        db.commit()
    return {"success": True}


@app.get("/admin/courses")
def admin_courses(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Course).order_by(Course.created_at.desc())).scalars().all()
    return [course_out(row) for row in rows]


@app.post("/admin/courses")
def admin_create_course(payload: CourseAdminIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    slug = slugify(payload.slug or payload.title)
    if db.execute(select(Course).where(Course.slug == slug)).scalar_one_or_none():
        slug = f"{slug}-{uuid4().hex[:6]}"
    course = Course(
        id=slug,
        slug=slug,
        title=payload.title,
        description=payload.description,
        intro=payload.intro,
        level=payload.level,
        price=payload.price,
        image=payload.image,
        duration=payload.duration,
        lesson_count=0,
        tags=payload.tags,
        is_published=payload.isPublished,
    )
    db.add(course)
    db.commit()
    return {"success": True, "course": course_out(course)}


@app.put("/admin/courses/{course_id}")
def admin_update_course(course_id: str, payload: CourseAdminIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    course = get_course_for_admin(db, course_id)
    course.title = payload.title
    course.description = payload.description
    course.intro = payload.intro
    course.level = payload.level
    course.price = payload.price
    course.image = payload.image
    course.duration = payload.duration
    course.tags = payload.tags
    course.is_published = payload.isPublished
    course.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "course": course_out(course)}


@app.delete("/admin/courses/{course_id}")
def admin_delete_course(course_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    course = get_course_for_admin(db, course_id)
    for model in (LessonProgress, Lesson, CourseModule, Enrollment, Payment, Certificate):
        key = model.course_id == course.id
        for row in db.execute(select(model).where(key)).scalars().all():
            db.delete(row)
    db.delete(course)
    db.commit()
    return {"success": True}


@app.get("/admin/courses/{course_id}")
def admin_course_detail(course_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    course = get_course_for_admin(db, course_id)
    modules = get_course_modules_payload(db, course.id, set(), can_access_paid=True)
    return {**course_out(course), "modules": modules}


@app.post("/admin/courses/{course_id}/modules")
def admin_create_module(course_id: str, payload: ModuleAdminIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    course = get_course_for_admin(db, course_id)
    module = CourseModule(id=str(uuid4()), course_id=course.id, title=payload.title, description=payload.description, sort_order=payload.sortOrder)
    db.add(module)
    db.commit()
    return {"success": True, "module": {"id": module.id, "title": module.title, "description": module.description, "sortOrder": module.sort_order, "lessons": []}}


@app.post("/admin/courses/{course_id}/modules/{module_id}/lessons")
def admin_create_lesson(course_id: str, module_id: str, payload: LessonAdminIn, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    course = get_course_for_admin(db, course_id)
    module = db.get(CourseModule, module_id)
    if not module or module.course_id != course.id:
        raise HTTPException(status_code=404, detail="Modulo no encontrado")
    lesson = Lesson(
        id=str(uuid4()),
        course_id=course.id,
        module_id=module.id,
        title=payload.title,
        description=payload.description,
        content=payload.content,
        video_url=payload.videoUrl,
        duration=payload.duration,
        sort_order=payload.sortOrder,
        is_free_preview=payload.isFreePreview,
    )
    db.add(lesson)
    db.flush()
    course.lesson_count = db.scalar(select(func.count()).select_from(Lesson).where(Lesson.course_id == course.id)) or 0
    course.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "lesson": lesson_out(lesson, False, True)}


@app.delete("/admin/lessons/{lesson_id}")
def admin_delete_lesson(lesson_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if lesson:
        course = db.get(Course, lesson.course_id)
        for row in db.execute(select(LessonProgress).where(LessonProgress.lesson_id == lesson.id)).scalars().all():
            db.delete(row)
        db.delete(lesson)
        db.flush()
        if course:
            course.lesson_count = db.scalar(select(func.count()).select_from(Lesson).where(Lesson.course_id == course.id)) or 0
        db.commit()
    return {"success": True}


@app.get("/admin/email-notifications")
def admin_email_notifications(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(EmailNotification).order_by(EmailNotification.created_at.desc()).limit(100)).scalars().all()
    return [email_out(row) for row in rows]


@app.post("/admin/email-notifications/{notification_id}/send")
def admin_send_email_notification(notification_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    notification = db.get(EmailNotification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Email no encontrado")
    deliver_email(notification)
    db.commit()
    db.refresh(notification)
    return {"success": notification.status == "sent", "email": email_out(notification)}


@app.get("/admin/certificates")
def admin_certificates(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(Certificate).order_by(Certificate.issued_at.desc()).limit(100)).scalars().all()
    payload = []
    for row in rows:
        payload.append(certificate_out(row, db.get(Course, row.course_id), db.get(User, row.user_id)))
    return payload


@app.post("/chat/start")
def chat_start(payload: ChatStartIn, db: Session = Depends(get_db)):
    session = ChatSession(
        id=str(uuid4()),
        guest_id=payload.guestId or str(uuid4()),
        state="INTENT_DETECTION",
        data={},
        messages=[],
        status="active",
    )
    message = f"{bot_message('GREETING', {})}\n\n{bot_message('INTENT_DETECTION', {})}"
    session.messages = [chat_message("bot", message)]
    db.add(session)
    db.commit()
    return {"sessionId": session.id, "guestId": session.guest_id, "message": message, "state": session.state}


@app.get("/chat/session/{session_id}")
def chat_session(session_id: str, db: Session = Depends(get_db)):
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")
    return chat_session_out(session)


@app.get("/chat/resume/{guest_id}")
def chat_resume(guest_id: str, db: Session = Depends(get_db)):
    session = db.execute(
        select(ChatSession).where(ChatSession.guest_id == guest_id, ChatSession.status == "active").order_by(ChatSession.updated_at.desc())
    ).scalar_one_or_none()
    return {"session": chat_session_out(session) if session else None}


@app.post("/chat/upload")
def chat_upload(payload: ChatUploadIn):
    ext = payload.fileName.lower().rsplit(".", 1)[-1] if "." in payload.fileName else ""
    allowed = {"stl", "obj", "3mf", "step", "stp", "jpg", "jpeg", "png", "gif", "webp", "pdf"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")
    if payload.fileSize > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo muy grande")
    return {
        "success": True,
        "file": {
            "id": str(uuid4()),
            "url": f"/uploads/{payload.sessionId or 'chat'}/{uuid4().hex}_{payload.fileName}",
            "fileName": payload.fileName,
            "fileCategory": "3d_model" if ext in {"stl", "obj", "3mf", "step", "stp"} else "image" if ext in {"jpg", "jpeg", "png", "gif", "webp"} else "document",
        },
    }


@app.post("/chat/message")
def chat_message_endpoint(payload: ChatMessageIn, db: Session = Depends(get_db)):
    session = db.get(ChatSession, payload.sessionId)
    if not session:
        raise HTTPException(status_code=404, detail="Sesion no encontrada")

    messages = list(session.messages or [])
    data = dict(session.data or {})
    current_state = session.state
    messages.append(chat_message("user", payload.message, payload.fileUrls))
    data = process_response(current_state, payload.message, data)
    if payload.fileUrls:
        if current_state == "FILE_UPLOAD":
            data["files"] = [*(data.get("files") or []), *payload.fileUrls]
            data["hasFile"] = True
        elif current_state == "PHOTO_UPLOAD":
            data["photos"] = [*(data.get("photos") or []), *payload.fileUrls]

    next_state = next_state_for(current_state, data, payload.message)
    response = bot_message(next_state, data)
    messages.append(chat_message("bot", response))
    session.state = next_state
    session.data = data
    session.messages = messages
    session.updated_at = datetime.utcnow()

    quote_request_id = None
    if next_state == "COMPLETE" and data.get("confirmed"):
        quote_request_id = create_bot_request(db, session, data)
        session.status = "completed"
        session.quote_request_id = quote_request_id

    db.commit()
    return {"message": response, "state": next_state, "data": data, "quoteRequestId": quote_request_id, "isComplete": next_state == "COMPLETE"}


@app.get("/admin/bot-requests")
def admin_bot_requests(_: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(select(BotRequest).order_by(BotRequest.created_at.desc())).scalars().all()
    return [bot_request_out(row) for row in rows]


@app.get("/admin/bot-requests/{request_id}")
def admin_bot_request_detail(request_id: str, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    request = db.get(BotRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    session = db.get(ChatSession, request.session_id)
    return {"request": bot_request_out(request), "conversation": (session.messages if session else [])}


@app.put("/admin/bot-requests/{request_id}")
async def update_bot_request(request_id: str, request: Request, _: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    bot_request = db.get(BotRequest, request_id)
    if not bot_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    body = await request.json()
    if "status" in body:
        bot_request.status = body["status"]
    bot_request.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True}


@app.post("/admin/bot-requests/{request_id}/convert")
async def convert_bot_request(request_id: str, request: Request, user: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    body = await request.json()
    bot_request = db.get(BotRequest, request_id)
    if not bot_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    contact = bot_request.contact or {}
    requirements = bot_request.requirements or {}
    quote = Quote(
        id=str(uuid4()),
        source_request_id=bot_request.id,
        source="chatbot",
        name=contact.get("name") or "Cliente chatbot",
        email=contact.get("email") or "sin-email@printstudios.cl",
        phone=contact.get("whatsapp"),
        service_id="custom_3d",
        material=requirements.get("material"),
        color=requirements.get("color"),
        quantity=int(requirements.get("quantity") or 1),
        notes=requirements.get("description"),
        estimated_price=int(body.get("estimatedPrice") or 0),
        estimated_days=int(body.get("estimatedDays") or 7),
        status="quoted",
        requirements=requirements,
        attachments=bot_request.attachments or [],
        admin_notes=body.get("notes"),
    )
    db.add(quote)
    bot_request.status = "QUOTED"
    bot_request.quote_id = quote.id
    bot_request.updated_at = datetime.utcnow()
    bot_request.admin_messages = [*(bot_request.admin_messages or []), {"type": "converted", "from": user.email, "timestamp": datetime.utcnow().isoformat()}]
    db.commit()
    return {"success": True, "quoteId": quote.id, "message": "Solicitud convertida a cotizacion"}


@app.post("/admin/bot-requests/{request_id}/request-info")
async def request_bot_info(request_id: str, request: Request, user: AdminUser = Depends(current_user), db: Session = Depends(get_db)):
    body = await request.json()
    bot_request = db.get(BotRequest, request_id)
    if not bot_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    bot_request.status = "WAITING_INFO"
    bot_request.updated_at = datetime.utcnow()
    bot_request.admin_messages = [
        *(bot_request.admin_messages or []),
        {"id": str(uuid4()), "type": "info_request", "from": user.email, "message": body.get("message"), "timestamp": datetime.utcnow().isoformat()},
    ]
    db.commit()
    return {"success": True, "message": "Solicitud enviada al cliente"}


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return value or uuid4().hex[:8]


def chat_message(role: str, content: str, file_urls: list[str] | None = None) -> dict[str, Any]:
    message = {"id": str(uuid4()), "role": role, "content": content, "timestamp": datetime.utcnow().isoformat()}
    if file_urls:
        message["fileUrls"] = file_urls
    return message


def chat_session_out(session: ChatSession) -> dict[str, Any]:
    return {
        "id": session.id,
        "guestId": session.guest_id,
        "state": session.state,
        "data": session.data or {},
        "messages": session.messages or [],
        "status": session.status,
        "quoteRequestId": session.quote_request_id,
        "createdAt": dt(session.created_at),
        "updatedAt": dt(session.updated_at),
    }


INTENT_TYPES = {
    "A": "Imprimir desde archivo 3D",
    "B": "Disenar/modelar desde cero",
    "C": "Duplicar pieza fisica",
    "D": "Reparar pieza",
    "E": "Reflejar/espejar pieza",
    "F": "Orientacion",
}


def bot_message(state: str, data: dict[str, Any]) -> str:
    messages = {
        "GREETING": "Hola! Soy el asistente de PrintStudios.cl.\n\nTe ayudare a cotizar tu proyecto de impresion 3D paso a paso. Que te gustaria hacer hoy?",
        "INTENT_DETECTION": "Elige una opcion:\n\nA) Tengo archivo 3D\nB) Disenar desde cero\nC) Duplicar una pieza\nD) Reparar una pieza\nE) Reflejar/espejar\nF) No estoy seguro",
        "DESCRIPTION": "Perfecto. Cuentame en pocas palabras: que necesitas imprimir?",
        "FILE_CHECK": "Tienes ya el archivo 3D (STL, OBJ, 3MF o STEP)?\n\nSi, lo tengo\nNo, necesito que lo disenen",
        "FILE_UPLOAD": "Genial. Por favor sube tu archivo 3D aqui.\n\nFormatos aceptados: STL, OBJ, 3MF, STEP (max 50MB).",
        "PHOTO_UPLOAD": "Como no tienes archivo 3D, sube fotos de referencia o describe la pieza con medidas. Ideal: frente, lado, arriba y algo para escala.",
        "DIMENSIONS": "Cuales son las dimensiones aproximadas? Indica largo, ancho y alto en mm o cm. Si no sabes, escribe no se.",
        "USAGE": "Para que se va a usar esta pieza? Decorativo, funcional, exterior, cerca de calor o alta resistencia.",
        "QUANTITY": "Cuantas unidades necesitas?",
        "MATERIAL": "Que material prefieres? PLA, PETG, ABS, TPU, resina o no se.",
        "COLOR": "Que color te gustaria?",
        "FINISH": "Que acabado necesitas? Estandar, lijado, pintado o alta calidad.",
        "TOLERANCE": "La pieza debe encajar con otras partes, tornillos o tolerancias especificas? Si no aplica, escribe no aplica.",
        "DEADLINE": "Para cuando lo necesitas? Urgente, normal (5-7 dias habiles) o flexible.",
        "DELIVERY": "Como prefieres recibir tu pedido? Retiro en taller o envio a domicilio.",
        "BUDGET": "Tienes un presupuesto estimado? Si no, escribe abierto.",
        "CONTACT": "Ya casi terminamos. Enviame nombre, email y WhatsApp.",
        "COMPLETE": "Solicitud enviada con exito. Revisaremos tu proyecto y te contactaremos en las proximas 24-48 horas.",
    }
    if state == "DIMENSIONS" and data.get("showDimensionHelp"):
        return "Sin problema. Mide largo, ancho y alto con regla o cinta metrica. Si es una pieza existente, incluye una foto con una moneda o regla para escala."
    if state == "MATERIAL" and data.get("usage"):
        rec = recommend_material(data.get("usage", ""))
        return f"{messages[state]}\n\nMi recomendacion: {rec['material']}. {rec['reason']}"
    if state == "SUMMARY":
        return generate_summary_text(data)
    return messages.get(state, "En que mas puedo ayudarte?")


def process_response(state: str, response: str, data: dict[str, Any]) -> dict[str, Any]:
    response_lower = response.lower().strip()
    if state == "INTENT_DETECTION":
        if response_lower.startswith("a") or "archivo" in response_lower:
            data.update({"intent": "A", "hasFile": True})
        elif response_lower.startswith("b") or "dise" in response_lower or "cero" in response_lower:
            data.update({"intent": "B", "hasFile": False})
        elif response_lower.startswith("c") or "duplicar" in response_lower:
            data.update({"intent": "C", "hasFile": False})
        elif response_lower.startswith("d") or "reparar" in response_lower:
            data["intent"] = "D"
        elif response_lower.startswith("e") or "espejar" in response_lower:
            data["intent"] = "E"
        else:
            data["intent"] = "F"
    elif state == "DESCRIPTION":
        data["description"] = response
    elif state == "FILE_CHECK":
        negative = any(word in response_lower for word in ["no", "necesito", "disenen", "diseño", "diseno"])
        data["hasFile"] = not negative and any(word in response_lower for word in ["si", "sí", "tengo", "archivo"])
    elif state == "DIMENSIONS":
        if "no se" in response_lower or "no sé" in response_lower:
            data["showDimensionHelp"] = True
            data["dimensionsUnknown"] = True
        else:
            data["dimensions"] = response
            data["showDimensionHelp"] = False
    elif state == "USAGE":
        data["usage"] = response
    elif state == "QUANTITY":
        match = re.search(r"\d+", response)
        data["quantity"] = int(match.group(0)) if match else 1
    elif state == "MATERIAL":
        data["material"] = recommend_material(data.get("usage", ""))["material"] if "no se" in response_lower or "no sé" in response_lower else response
    elif state == "COLOR":
        data["color"] = response
    elif state == "FINISH":
        data["finish"] = response
    elif state == "TOLERANCE":
        data["tolerance"] = response
    elif state == "DEADLINE":
        data["deadline"] = "Urgente" if "urgente" in response_lower else "Flexible" if "flexible" in response_lower else "Normal (5-7 dias)"
    elif state == "DELIVERY":
        if data.get("needsAddress"):
            data["deliveryAddress"] = response
            data["delivery"] = f"Envio a {response}"
            data["needsAddress"] = False
        elif "envio" in response_lower or "domicilio" in response_lower:
            data["delivery"] = "Envio a domicilio"
            data["needsAddress"] = True
        else:
            data["delivery"] = "Retiro en taller"
            data["needsAddress"] = False
    elif state == "BUDGET":
        data["budget"] = "Abierto" if response_lower == "abierto" else response
    elif state == "CONTACT":
        data["contact"] = parse_contact(response)
    elif state == "SUMMARY":
        data["confirmed"] = any(word in response_lower for word in ["confirmar", "ok", "correcto", "si", "sí"])
        data["needsCorrection"] = any(word in response_lower for word in ["corregir", "cambiar"])
    return data


def next_state_for(state: str, data: dict[str, Any], response: str) -> str:
    if state == "GREETING":
        return "INTENT_DETECTION"
    if state == "INTENT_DETECTION":
        return "DESCRIPTION"
    if state == "DESCRIPTION":
        return "FILE_CHECK"
    if state == "FILE_CHECK":
        return "FILE_UPLOAD" if data.get("hasFile") else "PHOTO_UPLOAD"
    if state in {"FILE_UPLOAD", "PHOTO_UPLOAD"}:
        return "DIMENSIONS"
    if state == "DIMENSIONS":
        return "DIMENSIONS" if data.get("showDimensionHelp") else "USAGE"
    if state == "USAGE":
        return "QUANTITY"
    if state == "QUANTITY":
        return "MATERIAL"
    if state == "MATERIAL":
        return "COLOR"
    if state == "COLOR":
        return "FINISH"
    if state == "FINISH":
        usage = (data.get("usage") or "").lower()
        return "TOLERANCE" if "funcional" in usage or "mecanic" in usage or "encaje" in usage else "DEADLINE"
    if state == "TOLERANCE":
        return "DEADLINE"
    if state == "DEADLINE":
        return "DELIVERY"
    if state == "DELIVERY":
        return "DELIVERY" if data.get("needsAddress") else "BUDGET"
    if state == "BUDGET":
        return "CONTACT"
    if state == "CONTACT":
        return "SUMMARY"
    if state == "SUMMARY":
        return "COMPLETE" if data.get("confirmed") else "DESCRIPTION"
    return "COMPLETE"


def recommend_material(usage: str) -> dict[str, str]:
    usage = usage.lower()
    if "exterior" in usage or "sol" in usage or "lluvia" in usage:
        return {"material": "PETG", "reason": "resiste mejor humedad y temperatura que PLA."}
    if "calor" in usage or "motor" in usage:
        return {"material": "ABS", "reason": "soporta mejor temperatura."}
    if "flex" in usage or "goma" in usage:
        return {"material": "TPU", "reason": "sirve para piezas flexibles."}
    if "detalle" in usage or "miniatura" in usage:
        return {"material": "Resina", "reason": "entrega mejor detalle."}
    if "funcional" in usage or "resist" in usage:
        return {"material": "PETG", "reason": "es buena opcion para piezas funcionales."}
    return {"material": "PLA", "reason": "es versatil y economico para proyectos generales."}


def parse_contact(text: str) -> dict[str, str | None]:
    email = re.search(r"[\w.\-+]+@[\w.\-]+\.\w+", text)
    phone = re.search(r"\+?56?[\d\s\-]{8,}", text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = None
    for line in lines:
        if "@" not in line and not re.search(r"\d{8,}", line):
            name = line.split(":", 1)[-1].strip()
            break
    return {"name": name or (lines[0] if lines else None), "email": email.group(0) if email else None, "whatsapp": phone.group(0).strip() if phone else None}


def validate_requirements(data: dict[str, Any]) -> dict[str, Any]:
    missing = []
    if not data.get("description"):
        missing.append("descripcion del proyecto")
    if not data.get("hasFile") and not data.get("photos"):
        missing.append("archivo 3D o fotos de referencia")
    if not data.get("dimensions") and not data.get("dimensionsUnknown"):
        missing.append("dimensiones aproximadas")
    if not data.get("quantity"):
        missing.append("cantidad de unidades")
    contact = data.get("contact") or {}
    if not contact.get("name") or not contact.get("email"):
        missing.append("datos de contacto")
    return {"isComplete": not missing, "missing": missing}


def generate_summary_text(data: dict[str, Any]) -> str:
    summary = ["Resumen de tu solicitud:"]
    if data.get("description"):
        summary.append(f"Proyecto: {data['description']}")
    if data.get("dimensions"):
        summary.append(f"Dimensiones: {data['dimensions']}")
    if data.get("quantity"):
        summary.append(f"Cantidad: {data['quantity']}")
    if data.get("material"):
        summary.append(f"Material: {data['material']}")
    if data.get("deadline"):
        summary.append(f"Plazo: {data['deadline']}")
    summary.append("\nEscribe confirmar para enviar o corregir para ajustar algo.")
    return "\n".join(summary)


def generate_admin_summary(data: dict[str, Any]) -> dict[str, Any]:
    bullets = [
        f"Proyecto: {data.get('description') or 'No especificado'}",
        f"Tipo: {INTENT_TYPES.get(data.get('intent'), 'General')}",
        f"Material: {data.get('material') or 'Por definir'}",
        f"Cantidad: {data.get('quantity') or 1}",
        f"Urgencia: {data.get('deadline') or 'Normal'}",
    ]
    risks = []
    if not data.get("hasFile"):
        risks.append("Requiere modelado o revision desde referencias.")
    if data.get("deadline") == "Urgente":
        risks.append("Pedido urgente: revisar recargo y capacidad.")
    questions = []
    if not data.get("dimensions"):
        questions.append("Confirmar dimensiones exactas.")
    return {"bullets": bullets, "risks": risks, "questions": questions, "contact": data.get("contact")}


def create_bot_request(db: Session, session: ChatSession, data: dict[str, Any]) -> str:
    validation = validate_requirements(data)
    attachments = [
        *[{"url": url, "type": "3d_model"} for url in data.get("files", [])],
        *[{"url": url, "type": "photo"} for url in data.get("photos", [])],
    ]
    request = BotRequest(
        id=str(uuid4()),
        session_id=session.id,
        guest_id=session.guest_id,
        intent_type=data.get("intent") or "F",
        requirements=data,
        attachments=attachments,
        contact=data.get("contact"),
        summary=generate_admin_summary(data),
        status="NEW",
        is_complete=validation["isComplete"],
        missing_info=validation["missing"],
    )
    db.add(request)
    db.flush()
    return request.id


def get_course_by_id_or_slug(db: Session, course_id: str) -> Course:
    course = db.get(Course, course_id)
    if not course:
        course = db.execute(select(Course).where(Course.slug == course_id)).scalar_one_or_none()
    if not course or not course.is_published:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course


def get_course_for_admin(db: Session, course_id: str) -> Course:
    course = db.get(Course, course_id)
    if not course:
        course = db.execute(select(Course).where(Course.slug == course_id)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course


def get_enrollment(db: Session, user_id: str, course_id: str) -> Enrollment | None:
    return db.execute(select(Enrollment).where(Enrollment.user_id == user_id, Enrollment.course_id == course_id)).scalar_one_or_none()


def get_lesson_progress(db: Session, user_id: str, lesson_id: str) -> LessonProgress | None:
    return db.execute(select(LessonProgress).where(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)).scalar_one_or_none()


def get_completed_lesson_ids(db: Session, user_id: str, course_id: str) -> set[str]:
    rows = db.execute(
        select(LessonProgress.lesson_id).where(
            LessonProgress.user_id == user_id,
            LessonProgress.course_id == course_id,
            LessonProgress.completed == True,
        )
    ).all()
    return {row[0] for row in rows}


def get_course_modules_payload(db: Session, course_id: str, completed: set[str], can_access_paid: bool) -> list[dict[str, Any]]:
    modules = db.execute(
        select(CourseModule).where(CourseModule.course_id == course_id).order_by(CourseModule.sort_order)
    ).scalars().all()
    payload = []
    for module in modules:
        lessons = db.execute(
            select(Lesson).where(Lesson.module_id == module.id).order_by(Lesson.sort_order)
        ).scalars().all()
        payload.append(module_out(module, lessons, completed, can_access_paid))
    return payload


def calculate_course_progress(db: Session, user_id: str, course_id: str) -> int:
    total = db.scalar(select(func.count()).select_from(Lesson).where(Lesson.course_id == course_id)) or 0
    if total == 0:
        return 0
    completed = db.scalar(
        select(func.count()).select_from(LessonProgress).where(
            LessonProgress.user_id == user_id,
            LessonProgress.course_id == course_id,
            LessonProgress.completed == True,
        )
    ) or 0
    return int(round((completed / total) * 100))


def ensure_certificate(db: Session, user: User, course_id: str) -> Certificate:
    certificate = db.execute(select(Certificate).where(Certificate.user_id == user.id, Certificate.course_id == course_id)).scalar_one_or_none()
    if certificate:
        return certificate
    course = db.get(Course, course_id)
    course_title = course.title if course else "Curso PrintStudios"
    certificate = Certificate(
        id=str(uuid4()),
        user_id=user.id,
        course_id=course_id,
        certificate_code=f"PS-{datetime.utcnow().strftime('%Y%m%d')}-{uuid4().hex[:8].upper()}",
    )
    db.add(certificate)
    certificate_url = f"{os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3005')}/certificados/{certificate.certificate_code}"
    queue_email(
        db,
        user.email,
        f"Certificado emitido: {course_title}",
        f"Felicitaciones {user.name}. Tu certificado de {course_title} ya esta disponible: {certificate_url}",
        "certificate_issued",
    )
    return certificate
