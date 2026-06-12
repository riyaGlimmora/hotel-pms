from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("/", response_model=List[InvoiceOut])
def get_invoices(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Invoice).all()

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice