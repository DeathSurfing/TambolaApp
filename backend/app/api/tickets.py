from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import datetime
from typing import List

from database import get_session
from models.ticket import Ticket
from schemas.ticket import TicketGenerateRequest, TicketGenerateResponse
from utils.generator import BingoTicketGenerator

router = APIRouter()


@router.post("/generate", response_model=TicketGenerateResponse)
def generate_tickets(
    request: TicketGenerateRequest,
    session: Session = Depends(get_session)
) -> TicketGenerateResponse:
    """Generate bingo tickets"""
    
    if request.count <= 0 or request.count > 100:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 100")
    
    try:
        # Generate tickets
        tickets_grids = BingoTicketGenerator.generate_tickets(request.count)
        
        # Save to database (optional - you can remove this if you don't want persistence)
        saved_tickets = []
        for grid in tickets_grids:
            ticket = Ticket(
                grid=grid,
                created_at=datetime.now().isoformat()
            )
            session.add(ticket)
            saved_tickets.append(ticket)
        
        session.commit()
        
        return TicketGenerateResponse(tickets=tickets_grids)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating tickets: {str(e)}")
