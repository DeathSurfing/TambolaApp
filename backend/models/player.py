from typing import Optional, List, Dict
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, JSON, Column, Relationship
from datetime import datetime
import random
import string


def generate_player_id() -> str:
    """Generate a short, unique player ID (6 characters)"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Player(SQLModel, table=True):
    """Database model for players"""
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: str = Field(unique=True, index=True)  # Short ID like "ABC123"
    name: str
    is_admin: bool = Field(default=False)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    # Relationships
    tickets: List["PlayerTicket"] = Relationship(back_populates="player")
    game_sessions: List["GameSession"] = Relationship(back_populates="players")


class PlayerTicket(SQLModel, table=True):
    """Database model for player tickets with strike information"""
    id: Optional[int] = Field(default=None, primary_key=True)
    ticket_id: UUID = Field(default_factory=uuid4)
    player_id: str = Field(foreign_key="player.player_id")
    game_session_id: Optional[int] = Field(default=None, foreign_key="gamesession.id")
    
    # Ticket data
    grid: List[List[Optional[int]]] = Field(sa_column=Column(JSON))  # Original ticket
    strikes: Dict[str, bool] = Field(default={}, sa_column=Column(JSON))  # {"row-col": True/False}
    
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    # Relationships
    player: Optional[Player] = Relationship(back_populates="tickets")
    game_session: Optional["GameSession"] = Relationship(back_populates="tickets")


class GameSession(SQLModel, table=True):
    """Database model for game sessions supporting multiplayer"""
    id: Optional[int] = Field(default=None, primary_key=True)
    session_code: str = Field(unique=True, index=True)  # Short session code
    admin_player_id: str = Field(foreign_key="player.player_id")
    
    # Game state
    current_number: Optional[int] = Field(default=None)
    called_numbers: List[int] = Field(default=[], sa_column=Column(JSON))
    remaining_numbers: List[int] = Field(default_factory=lambda: list(range(1, 91)), sa_column=Column(JSON))
    
    # Session info
    is_active: bool = Field(default=True)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    # Relationships
    players: List[Player] = Relationship(back_populates="game_sessions")
    tickets: List[PlayerTicket] = Relationship(back_populates="game_session")


def generate_session_code() -> str:
    """Generate a short, unique session code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
