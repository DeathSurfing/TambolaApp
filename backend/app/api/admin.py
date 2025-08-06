from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List

from database import get_session
from models.player import Player, PlayerTicket, GameSession
from schemas.multiplayer import (
    AdminTicketGenerate, AdminSessionInfo, PlayerResponse, 
    PlayerTicketResponse, SuccessResponse
)
from utils.generator import BingoTicketGenerator

router = APIRouter()


def verify_admin(player_id: str, session: Session) -> Player:
    """Verify that a player is an admin"""
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if not player.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return player


@router.post("/generate-tickets", response_model=List[PlayerTicketResponse])
def admin_generate_tickets_for_player(
    ticket_request: AdminTicketGenerate,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> List[PlayerTicketResponse]:
    """Admin endpoint to generate tickets for any player"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    # Verify target player exists
    target_player = session.exec(
        select(Player).where(Player.player_id == ticket_request.player_id)
    ).first()
    if not target_player:
        raise HTTPException(status_code=404, detail="Target player not found")
    
    # Verify session exists if provided
    game_session = None
    if ticket_request.session_code:
        game_session = session.exec(
            select(GameSession).where(GameSession.session_code == ticket_request.session_code)
        ).first()
        if not game_session:
            raise HTTPException(status_code=404, detail="Game session not found")
    
    if ticket_request.count <= 0 or ticket_request.count > 20:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 20")
    
    try:
        # Generate tickets
        ticket_grids = BingoTicketGenerator.generate_tickets(ticket_request.count)
        
        created_tickets = []
        for grid in ticket_grids:
            ticket = PlayerTicket(
                player_id=ticket_request.player_id,
                grid=grid,
                strikes={},
                game_session_id=game_session.id if game_session else None
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


@router.get("/session/{session_code}", response_model=AdminSessionInfo)
def get_session_admin_info(
    session_code: str,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> AdminSessionInfo:
    """Get detailed session information for admin"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    # Get game session
    game_session = session.exec(
        select(GameSession).where(GameSession.session_code == session_code)
    ).first()
    
    if not game_session:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    # Get all tickets in the session
    session_tickets = session.exec(
        select(PlayerTicket).where(PlayerTicket.game_session_id == game_session.id)
    ).all()
    
    # Get unique players
    unique_player_ids = set(ticket.player_id for ticket in session_tickets)
    
    players = []
    for player_id in unique_player_ids:
        player = session.exec(select(Player).where(Player.player_id == player_id)).first()
        if player:
            players.append(PlayerResponse(
                id=player.id,
                player_id=player.player_id,
                name=player.name,
                is_admin=player.is_admin,
                created_at=player.created_at
            ))
    
    return AdminSessionInfo(
        session_code=game_session.session_code,
        admin_player_id=game_session.admin_player_id,
        players=players,
        total_tickets=len(session_tickets),
        current_number=game_session.current_number,
        called_numbers=game_session.called_numbers,
        remaining_numbers=game_session.remaining_numbers,
        is_active=game_session.is_active
    )


@router.get("/players", response_model=List[PlayerResponse])
def get_all_players(
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> List[PlayerResponse]:
    """Get list of all players (admin only)"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    players = session.exec(select(Player)).all()
    
    return [
        PlayerResponse(
            id=player.id,
            player_id=player.player_id,
            name=player.name,
            is_admin=player.is_admin,
            created_at=player.created_at
        )
        for player in players
    ]


@router.get("/sessions", response_model=List[AdminSessionInfo])
def get_all_sessions(
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> List[AdminSessionInfo]:
    """Get list of all game sessions (admin only)"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    game_sessions = session.exec(select(GameSession)).all()
    
    result = []
    for game_session in game_sessions:
        # Get session tickets and players
        session_tickets = session.exec(
            select(PlayerTicket).where(PlayerTicket.game_session_id == game_session.id)
        ).all()
        
        unique_player_ids = set(ticket.player_id for ticket in session_tickets)
        players = []
        
        for player_id in unique_player_ids:
            player = session.exec(select(Player).where(Player.player_id == player_id)).first()
            if player:
                players.append(PlayerResponse(
                    id=player.id,
                    player_id=player.player_id,
                    name=player.name,
                    is_admin=player.is_admin,
                    created_at=player.created_at
                ))
        
        result.append(AdminSessionInfo(
            session_code=game_session.session_code,
            admin_player_id=game_session.admin_player_id,
            players=players,
            total_tickets=len(session_tickets),
            current_number=game_session.current_number,
            called_numbers=game_session.called_numbers,
            remaining_numbers=game_session.remaining_numbers,
            is_active=game_session.is_active
        ))
    
    return result


@router.delete("/player/{player_id}", response_model=SuccessResponse)
def delete_player(
    player_id: str,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Delete a player and all their tickets (admin only)"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    # Don't allow deleting self
    if player_id == admin_player_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Get player
    player = session.exec(select(Player).where(Player.player_id == player_id)).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Delete all player tickets
    player_tickets = session.exec(
        select(PlayerTicket).where(PlayerTicket.player_id == player_id)
    ).all()
    
    for ticket in player_tickets:
        session.delete(ticket)
    
    # Delete player
    session.delete(player)
    session.commit()
    
    return SuccessResponse(
        success=True,
        message=f"Player {player_id} and {len(player_tickets)} tickets deleted",
        data={
            "deleted_player_id": player_id,
            "deleted_tickets": len(player_tickets)
        }
    )


@router.post("/player/{player_id}/make-admin", response_model=SuccessResponse)
def make_player_admin(
    player_id: str,
    admin_player_id: str,
    session: Session = Depends(get_session)
) -> SuccessResponse:
    """Make a player an admin (admin only)"""
    
    # Verify admin privileges
    verify_admin(admin_player_id, session)
    
    # Get target player
    target_player = session.exec(
        select(Player).where(Player.player_id == player_id)
    ).first()
    if not target_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if target_player.is_admin:
        raise HTTPException(status_code=400, detail="Player is already an admin")
    
    # Make admin
    target_player.is_admin = True
    session.add(target_player)
    session.commit()
    
    return SuccessResponse(
        success=True,
        message=f"Player {player_id} is now an admin",
        data={"player_id": player_id}
    )
