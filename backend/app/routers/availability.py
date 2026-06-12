from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.room import Room
from app.models.booking import Booking
from app.schemas.room import RoomOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/availability", tags=["Availability"])

@router.get("/", response_model=List[RoomOut])
def get_available_rooms(
    check_in: date = Query(...),
    check_out: date = Query(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    booked_room_ids = db.query(Booking.room_id).filter(
        Booking.status != "cancelled",
        Booking.check_in < check_out,
        Booking.check_out > check_in
    ).all()
    booked_ids = [r[0] for r in booked_room_ids]
    available = db.query(Room).filter(
        Room.status != "maintenance",
        ~Room.id.in_(booked_ids)
    ).all()
    return available