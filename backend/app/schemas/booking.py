from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.schemas.room import RoomOut

class BookingCreate(BaseModel):
    guest_name: str
    num_guests: int
    check_in: date
    check_out: date
    room_id: int

class BookingUpdate(BaseModel):
    status: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    guest_name: str
    num_guests: int
    check_in: date
    check_out: date
    status: str
    room_id: int
    user_id: int
    created_at: datetime
    room: RoomOut

    class Config:
        from_attributes = True