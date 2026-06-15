from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ExtraCharge(Base):
    __tablename__ = "extra_charges"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    booking = relationship("Booking", back_populates="extra_charges")
