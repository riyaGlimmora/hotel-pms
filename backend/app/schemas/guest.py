from pydantic import BaseModel, EmailStr
from datetime import datetime

class GuestBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str | None = None
    id_type: str | None = None
    id_number: str | None = None

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    id_type: str | None = None
    id_number: str | None = None

class GuestOut(GuestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
