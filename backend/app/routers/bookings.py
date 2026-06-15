from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.schemas.booking import BookingCreate, BookingOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

@router.get("/", response_model=List[BookingOut])
def get_bookings(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Booking).all()

@router.post("/", response_model=BookingOut)
def create_booking(data: BookingCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Validate dates
    if data.check_out <= data.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # Validate guests
    if data.num_guests <= 0:
        raise HTTPException(status_code=400, detail="Number of guests must be at least 1")
    
    # Validate guest name
    if not data.guest_name.strip():
        raise HTTPException(status_code=400, detail="Guest name is required")
    
    room = db.query(Room).filter(Room.id == data.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status == "maintenance":
        raise HTTPException(status_code=400, detail="Room is under maintenance and cannot be booked")
    
    # Double booking check - find overlapping non-cancelled bookings
    overlap = db.query(Booking).filter(
        Booking.room_id == data.room_id,
        Booking.status != "cancelled",
        Booking.check_in < data.check_out,
        Booking.check_out > data.check_in
    ).first()
    
    if overlap:
        raise HTTPException(status_code=400, detail=f"Room already booked from {overlap.check_in} to {overlap.check_out}")
    
    booking = Booking(
        guest_name=data.guest_name,
        num_guests=data.num_guests,
        check_in=data.check_in,
        check_out=data.check_out,
        room_id=data.room_id,
        user_id=current_user.id
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled"}