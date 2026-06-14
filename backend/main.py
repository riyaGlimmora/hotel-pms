from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import Base, engine
from app.models import user, room, booking, invoice
from app.routers import auth, rooms, bookings, checkin, invoices, availability

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hotel PMS API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "https://hotel-pms-five.vercel.app",
    "https://hotel-9oulagtw1-riya-vlog.vercel.app",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(checkin.router)
app.include_router(invoices.router)
app.include_router(availability.router)

@app.get("/")
def root():
    return {"message": "Hotel PMS API is running"}

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return JSONResponse(
        content="OK",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )