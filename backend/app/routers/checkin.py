from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.booking import Booking
from app.models.invoice import Invoice
from app.models.extra_charge import ExtraCharge
from app.schemas.booking import BookingOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/checkin", tags=["Check-in / Check-out"])

@router.post("/{booking_id}/checkin", response_model=BookingOut)
def check_in(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail=f"Cannot check in. Status is '{booking.status}'")
    booking.status = "checked_in"
    booking.room.status = "occupied"
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/{booking_id}/checkout", response_model=BookingOut)
def check_out(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "checked_in":
        raise HTTPException(status_code=400, detail=f"Cannot check out. Status is '{booking.status}'")
    
    nights = (booking.check_out - booking.check_in).days
    room_charge = nights * booking.room.price_per_night
    
    # Calculate extra charges total
    extra_charges = db.query(ExtraCharge).filter(ExtraCharge.booking_id == booking.id).all()
    extra_charges_total = sum(charge.amount for charge in extra_charges)
    
    # Calculate total invoice amount
    total = room_charge + extra_charges_total
    
    booking.status = "checked_out"
    booking.room.status = "available"
    invoice = Invoice(
        booking_id=booking.id,
        nights_stayed=nights,
        room_rate=booking.room.price_per_night,
        extra_charges_total=extra_charges_total,
        total_amount=total
    )
    db.add(invoice)
    db.commit()
    db.refresh(booking)
    return booking