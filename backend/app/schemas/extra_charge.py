from pydantic import BaseModel
from datetime import datetime

class ExtraChargeBase(BaseModel):
    description: str
    amount: float

class ExtraChargeCreate(ExtraChargeBase):
    pass

class ExtraChargeOut(ExtraChargeBase):
    id: int
    booking_id: int
    created_at: datetime

    class Config:
        from_attributes = True
