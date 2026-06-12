from pydantic import BaseModel
from datetime import datetime
from app.schemas.booking import BookingOut

class InvoiceOut(BaseModel):
    id: int
    total_amount: float
    nights_stayed: int
    room_rate: float
    issued_at: datetime
    booking_id: int
    booking: BookingOut

    class Config:
        from_attributes = True