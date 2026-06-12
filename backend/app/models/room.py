from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, nullable=False)
    room_type = Column(String, nullable=False)
    price_per_night = Column(Float, nullable=False)
    status = Column(String, default="available")
    description = Column(String, nullable=True)

    bookings = relationship("Booking", back_populates="room")