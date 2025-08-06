from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List

from database import get_session
from models.player import Player, PlayerTicket, generate_player_id
from schemas.multiplayer import (
    PlayerCreate, PlayerResponse, PlayerTicketCreate, 
    PlayerTicketResponse, TicketStrike, SuccessResponse
)
from utils.generator import BingoTicketGenerator

router = APIRouter()


@router.post("/create", response_model=PlayerResponse)
def create_player(
    player_data: PlayerCreate,
    session: Session = Depends(get_session)
) -> PlayerResponse:
    """Create a new player with unique short ID"""
    
    # Generate unique player ID
    while True:
        player_id = generate_player_id()
        existing = session.exec(select(Player).where(Player.player_id == player_id)).first()
        if not existing:
            break
    
    # Create player
    player = Player(
        player_id=player_id,
        name=player_data.name,
        is_admin=player_data.is_admin
    )
    
    session.add(player)
    session.commit()
    session.refresh(player)
    
    return PlayerResponse(
        id=player.id,
        player_id=player.player_id,
        name=player.name,
        is_admin=player.is_admin,
        created_at=player.created_at
    )


@router.get("/{player_id}", response_model=PlayerResponse)
def get_player(
    player_id: str,
    session: Session = Depends(get_session)
) -> PlayerResponse:
    """Get player information by their short ID"""
    
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return PlayerResponse(
        id=player.id,
        player_id=player.player_id,
        name=player.name,
        is_admin=player.is_admin,
        created_at=player.created_at
    )


@router.get("/{player_id}/tickets", response_model=List[PlayerTicketResponse])
def get_player_tickets(
    player_id: str,
    session: Session = Depends(get_session)
) -> List[PlayerTicketResponse]:
    """Get all tickets for a specific player"""
    
    # Verify player exists
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get player tickets
    tickets = session.exec(
        select(PlayerTicket).where(PlayerTicket.player_id == player_id)
    ).all()
    
    return [
        PlayerTicketResponse(
            ticket_id=ticket.ticket_id,
            player_id=ticket.player_id,
            grid=ticket.grid,
            strikes=ticket.strikes,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at
        )
        for ticket in tickets
    ]


@router.post("/{player_id}/tickets", response_model=List[PlayerTicketResponse])
def generate_tickets_for_player(
    player_id: str,
    ticket_request: PlayerTicketCreate,
    session: Session = Depends(get_session)
) -> List[PlayerTicketResponse]:
    """Generate tickets for a specific player"""
    
    # Verify player exists
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if ticket_request.count <= 0 or ticket_request.count > 10:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 10")
    
    try:
        # Generate tickets
        ticket_grids = BingoTicketGenerator.generate_tickets(ticket_request.count)
        
        created_tickets = []
        for grid in ticket_grids:
            ticket = PlayerTicket(
                player_id=player_id,
                grid=grid,
                strikes={},  # Initialize empty strikes
                game_session_id=None  # Will be set when joining a session
            )
            session.add(ticket)
            created_tickets.append(ticket)
        
        session.commit()
        
        # Refresh all tickets to get IDs
        for ticket in created_tickets:
            session.refresh(ticket)
        
        return [
            PlayerTicketResponse(
                ticket_id=ticket.ticket_id,
                player_id=ticket.player_id,
                grid=ticket.grid,
                strikes=ticket.strikes,
                created_at=ticket.created_at,
                updated_at=ticket.updated_at
            )
            for ticket in created_tickets
        ]
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating tickets: {str(e)}")


@router.post("/tickets/strike", response_model=SuccessResponse)
def strike_number_on_ticket(
    strike_data: TicketStrike,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Strike or unstrike a number on a player's ticket"""
    
    # Get the ticket
    ticket = session.exec(
        select(PlayerTicket).where(PlayerTicket.ticket_id == strike_data.ticket_id)
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Validate row/col bounds
    if not (0 <= strike_data.row <= 2 and 0 <= strike_data.col <= 8):
        raise HTTPException(status_code=400, detail="Invalid row or column")
    
    # Check if there's a number at that position
    if ticket.grid[strike_data.row][strike_data.col] is None:
        raise HTTPException(status_code=400, detail="No number at that position")
    
    # Create strike key
    strike_key = f"{strike_data.row}-{strike_data.col}"
    
    # Update strikes
    if not ticket.strikes:
        ticket.strikes = {}
    
    ticket.strikes[strike_key] = strike_data.strike
    ticket.updated_at = datetime.now().isoformat()
    
    session.add(ticket)
    session.commit()
    
    action = "struck" if strike_data.strike else "unstruk"
    number = ticket.grid[strike_data.row][strike_data.col]
    
    return SuccessResponse(
        success=True,
        message=f"Number {number} {action} successfully",
        data={
            "ticket_id": str(strike_data.ticket_id),
            "number": number,
            "position": f"row {strike_data.row}, col {strike_data.col}",
            "strike": strike_data.strike
        }
    )
