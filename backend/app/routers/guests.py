from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.guest import Guest
from app.models.booking import Booking
from app.schemas.guest import GuestCreate, GuestUpdate, GuestOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/guests", tags=["Guests"])

@router.get("/", response_model=List[GuestOut])
def get_guests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Guest).order_by(Guest.created_at.desc()).all()

@router.get("/{guest_id}", response_model=GuestOut)
def get_guest(guest_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest

@router.post("/", response_model=GuestOut)
def create_guest(data: GuestCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(Guest).filter(Guest.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Guest with this email already exists")
    
    if data.id_number:
        existing_id = db.query(Guest).filter(Guest.id_number == data.id_number).first()
        if existing_id:
            raise HTTPException(status_code=400, detail="Guest with this ID number already exists")
    
    guest = Guest(**data.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest

@router.put("/{guest_id}", response_model=GuestOut)
def update_guest(guest_id: int, data: GuestUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    # Check email uniqueness if updating
    if data.email and data.email != guest.email:
        existing = db.query(Guest).filter(Guest.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(guest, key, value)
    
    db.commit()
    db.refresh(guest)
    return guest

@router.delete("/{guest_id}")
def delete_guest(guest_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    # Check if guest has bookings
    bookings = db.query(Booking).filter(Booking.guest_id == guest_id).all()
    if bookings:
        raise HTTPException(status_code=400, detail="Cannot delete guest with existing bookings")
    
    db.delete(guest)
    db.commit()
    return {"message": "Guest deleted successfully"}

@router.get("/{guest_id}/history", response_model=List[dict])
def get_guest_history(guest_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    bookings = db.query(Booking).filter(Booking.guest_id == guest_id).order_by(Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "room_number": b.room.room_number,
            "check_in": str(b.check_in),
            "check_out": str(b.check_out),
            "status": b.status,
            "created_at": str(b.created_at)
        }
        for b in bookings
    ]
