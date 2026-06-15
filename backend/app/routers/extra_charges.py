from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.extra_charge import ExtraCharge
from app.models.booking import Booking
from app.schemas.extra_charge import ExtraChargeCreate, ExtraChargeOut
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/extra-charges", tags=["Extra Charges"])

@router.post("/booking/{booking_id}", response_model=ExtraChargeOut)
def add_extra_charge(booking_id: int, data: ExtraChargeCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if booking is still in a state where we can add charges (not checked out/cancelled)
    if booking.status == 'checked_out':
        raise HTTPException(status_code=400, detail="Cannot add charges to checked out bookings")
    if booking.status == 'cancelled':
        raise HTTPException(status_code=400, detail="Cannot add charges to cancelled bookings")
    
    charge = ExtraCharge(booking_id=booking_id, **data.model_dump())
    db.add(charge)
    db.commit()
    db.refresh(charge)
    return charge

@router.get("/booking/{booking_id}", response_model=List[ExtraChargeOut])
def get_booking_charges(booking_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    charges = db.query(ExtraCharge).filter(ExtraCharge.booking_id == booking_id).all()
    return charges

@router.delete("/{charge_id}")
def delete_extra_charge(charge_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    charge = db.query(ExtraCharge).filter(ExtraCharge.id == charge_id).first()
    if not charge:
        raise HTTPException(status_code=404, detail="Charge not found")
    
    # Check if booking is still in a state where we can delete charges
    booking = charge.booking
    if booking.status == 'checked_out':
        raise HTTPException(status_code=400, detail="Cannot delete charges from checked out bookings")
    
    db.delete(charge)
    db.commit()
    return {"message": "Charge deleted successfully"}
