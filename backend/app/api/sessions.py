from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Optional
import random

from database import get_session
from models.player import Player, PlayerTicket, GameSession, generate_session_code
from schemas.multiplayer import (
    GameSessionCreate, GameSessionResponse, GameSessionState,
    NumberCall, NumberCallResponse, SuccessResponse
)

router = APIRouter()


@router.post("/create", response_model=GameSessionResponse)
def create_game_session(
    session_data: GameSessionCreate,
    session: Session = Depends(get_session)
) -> GameSessionResponse:
    """Create a new multiplayer game session"""
    
    # Verify admin player exists and is admin
    admin_player = session.exec(
        select(Player).where(Player.player_id == session_data.admin_player_id)
    ).first()
    
    if not admin_player:
        raise HTTPException(status_code=404, detail="Admin player not found")
    
    if not admin_player.is_admin:
        raise HTTPException(status_code=403, detail="Player is not an admin")
    
    # Generate unique session code
    while True:
        session_code = generate_session_code()
        existing = session.exec(
            select(GameSession).where(GameSession.session_code == session_code)
        ).first()
        if not existing:
            break
    
    # Create game session
    game_session = GameSession(
        session_code=session_code,
        admin_player_id=session_data.admin_player_id,
        current_number=None,
        called_numbers=[],
        remaining_numbers=list(range(1, 91)),  # 1-90
        is_active=True
    )
    
    session.add(game_session)
    session.commit()
    session.refresh(game_session)
    
    return GameSessionResponse(
        id=game_session.id,
        session_code=game_session.session_code,
        admin_player_id=game_session.admin_player_id,
        current_number=game_session.current_number,
        called_numbers=game_session.called_numbers,
        remaining_numbers=game_session.remaining_numbers,
        is_active=game_session.is_active,
        created_at=game_session.created_at,
        updated_at=game_session.updated_at
    )


@router.get("/{session_code}", response_model=GameSessionState)
def get_session_state(
    session_code: str,
    session: Session = Depends(get_session)
) -> GameSessionState:
    """Get current state of a game session"""
    
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Count players and tickets in this session
    tickets_count = len(session.exec(
        select(PlayerTicket).where(PlayerTicket.game_session_id == game_session.id)
    ).all())
    
    # Get unique players from tickets
    unique_players = set()
    tickets = session.exec(
        select(PlayerTicket).where(PlayerTicket.game_session_id == game_session.id)
    ).all()
    for ticket in tickets:
        unique_players.add(ticket.player_id)
    
    return GameSessionState(
        session_code=game_session.session_code,
        current_number=game_session.current_number,
        called_numbers=game_session.called_numbers,
        remaining_numbers=game_session.remaining_numbers,
        players_count=len(unique_players),
        tickets_count=tickets_count,
        is_active=game_session.is_active
    )


@router.post("/{session_code}/call-number", response_model=NumberCallResponse)
def call_next_number(
    session_code: str,
    session: Session = Depends(get_session)
) -> NumberCallResponse:
    """Call the next random number in the game session"""
    
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    if not game_session.is_active:
        raise HTTPException(status_code=400, detail="Game session is not active")
    
    if not game_session.remaining_numbers:
        raise HTTPException(status_code=400, detail="No numbers remaining in this session")
    
    # Pick random number from remaining
    called_number = random.choice(game_session.remaining_numbers)
    
    # Update session state - create new lists to ensure SQLModel tracks changes
    new_remaining = game_session.remaining_numbers.copy()
    new_remaining.remove(called_number)
    new_called = game_session.called_numbers.copy()
    new_called.append(called_number)
    
    game_session.remaining_numbers = new_remaining
    game_session.called_numbers = new_called
    game_session.current_number = called_number
    game_session.updated_at = datetime.now().isoformat()
    
    session.add(game_session)
    session.commit()
    
    return NumberCallResponse(
        session_code=session_code,
        called_number=called_number,
        remaining_count=len(game_session.remaining_numbers),
        all_called_numbers=game_session.called_numbers.copy()
    )


@router.post("/{session_code}/join", response_model=SuccessResponse)
def join_session(
    session_code: str,
    player_id: str,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Add a player's tickets to a game session"""
    
    # Verify game session exists
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Verify player exists
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get player's tickets that aren't already in a session
    player_tickets = session.exec(
        select(PlayerTicket).where(
            PlayerTicket.player_id == player_id,
            PlayerTicket.game_session_id == None
        )
    ).all()
    
    if not player_tickets:
        raise HTTPException(
            status_code=400, 
            detail="Player has no available tickets to join the session"
        )
    
    # Add tickets to session
    tickets_added = 0
    for ticket in player_tickets:
        ticket.game_session_id = game_session.id
        ticket.updated_at = datetime.now().isoformat()
        session.add(ticket)
        tickets_added += 1
    
    session.commit()
    
    return SuccessResponse(
        success=True,
        message=f"Player {player_id} joined session {session_code}",
        data={
            "player_id": player_id,
            "session_code": session_code,
            "tickets_added": tickets_added
        }
    )


@router.post("/{session_code}/reset", response_model=SuccessResponse)
def reset_session(
    session_code: str,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Reset a game session (admin only)"""
    
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Verify admin privileges
    if game_session.admin_player_id != admin_player_id:
        admin_player = session.exec(
            select(Player).where(Player.player_id == admin_player_id)
        ).first()
        
        if not admin_player or not admin_player.is_admin:
            raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Reset session state
    game_session.current_number = None
    game_session.called_numbers = []
    game_session.remaining_numbers = list(range(1, 91))
    game_session.updated_at = datetime.now().isoformat()
    
    # Reset all ticket strikes in this session
    session_tickets = session.exec(
        select(PlayerTicket).where(PlayerTicket.game_session_id == game_session.id)
    ).all()
    
    for ticket in session_tickets:
        ticket.strikes = {}
        ticket.updated_at = datetime.now().isoformat()
        session.add(ticket)
    
    session.add(game_session)
    session.commit()
    
    return SuccessResponse(
        success=True,
        message=f"Session {session_code} has been reset",
        data={
            "session_code": session_code,
            "tickets_reset": len(session_tickets)
        }
    )


@router.post("/{session_code}/deactivate", response_model=SuccessResponse)
def deactivate_session(
    session_code: str,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Deactivate a game session (admin only)"""
    
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Verify admin privileges
    if game_session.admin_player_id != admin_player_id:
        admin_player = session.exec(
            select(Player).where(Player.player_id == admin_player_id)
        ).first()
        
        if not admin_player or not admin_player.is_admin:
            raise HTTPException(status_code=403, detail="Admin privileges required")
    
    # Deactivate session
    game_session.is_active = False
    game_session.updated_at = datetime.now().isoformat()
    
    session.add(game_session)
    session.commit()
    
    return SuccessResponse(
        success=True,
        message=f"Session {session_code} has been deactivated",
        data={"session_code": session_code}
    )
