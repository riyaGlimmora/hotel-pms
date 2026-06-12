from pydantic import BaseModel
from typing import Optional

class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    price_per_night: float
    status: Optional[str] = "available"
    description: Optional[str] = None

class RoomUpdate(BaseModel):
    room_type: Optional[str] = None
    price_per_night: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None

class RoomOut(BaseModel):
    id: int
    room_number: str
    room_type: str
    price_per_night: float
    status: str
    description: Optional[str]

    class Config:
        from_attributes = True