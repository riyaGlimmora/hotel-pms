from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, nullable=False)
    nights_stayed = Column(Integer, nullable=False)
    room_rate = Column(Float, nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    booking = relationship("Booking", back_populates="invoice")