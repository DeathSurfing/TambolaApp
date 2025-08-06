from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import Optional
import random

from database import get_session
from models.game import NumberSession
from schemas.game import (
    GameStartResponse, 
    GamePickResponse, 
    GameStateResponse, 
    GameResetResponse
)

router = APIRouter()

# Global game state (for simplicity - in production, use database)
current_session: Optional[NumberSession] = None


def get_or_create_session(session: Session) -> NumberSession:
    """Get current session or create a new one"""
    global current_session
    
    if current_session is None:
        # Try to get the latest session from database
        statement = select(NumberSession).order_by(NumberSession.updated_at.desc())
        db_session = session.exec(statement).first()
        
        if db_session and db_session.remaining:
            current_session = db_session
        else:
            # Create new session
            current_session = NumberSession(
                history=[],
                remaining=list(range(1, 91)),  # 1 to 90
                current_number=None,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            session.add(current_session)
            session.commit()
            session.refresh(current_session)
    
    return current_session


@router.post("/start", response_model=GameStartResponse)
def start_game(session: Session = Depends(get_session)) -> GameStartResponse:
    """Start a new game session"""
    global current_session
    
    # Create new session
    current_session = NumberSession(
        history=[],
        remaining=list(range(1, 91)),  # 1 to 90
        current_number=None,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    
    session.add(current_session)
    session.commit()
    session.refresh(current_session)
    
    return GameStartResponse(
        message="New game started",
        session_id=str(current_session.id)
    )


@router.post("/pick", response_model=GamePickResponse)
def pick_number(session: Session = Depends(get_session)) -> GamePickResponse:
    """Pick the next random number"""
    game_session = get_or_create_session(session)
    
    if not game_session.remaining:
        raise HTTPException(status_code=400, detail="No numbers remaining")
    
    # Pick random number from remaining
    picked_number = random.choice(game_session.remaining)
    
    # Update session
    game_session.remaining.remove(picked_number)
    game_session.history.append(picked_number)
    game_session.current_number = picked_number
    game_session.updated_at = datetime.now().isoformat()
    
    # Save to database
    session.add(game_session)
    session.commit()
    
    return GamePickResponse(
        number=picked_number,
        history=game_session.history.copy()
    )


@router.get("/state", response_model=GameStateResponse)
def get_game_state(session: Session = Depends(get_session)) -> GameStateResponse:
    """Get current game state"""
    game_session = get_or_create_session(session)
    
    return GameStateResponse(
        current_number=game_session.current_number,
        picked_numbers=game_session.history.copy(),
        remaining_numbers=game_session.remaining.copy()
    )


@router.post("/reset", response_model=GameResetResponse)
def reset_game(session: Session = Depends(get_session)) -> GameResetResponse:
    """Reset the game"""
    global current_session
    
    # Create new session
    current_session = NumberSession(
        history=[],
        remaining=list(range(1, 91)),  # 1 to 90
        current_number=None,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    
    session.add(current_session)
    session.commit()
    session.refresh(current_session)
    
    return GameResetResponse(message="Game reset successfully")
