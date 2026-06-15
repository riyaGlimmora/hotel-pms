from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import user, room, booking, invoice
from app.routers import auth, rooms, bookings, checkin, invoices, availability

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hotel PMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://hotel-pms-five.vercel.app",
        "https://hotel-cqins789x-riya-vlog.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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