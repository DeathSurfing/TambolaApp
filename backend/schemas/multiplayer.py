from typing import Optional, List, Dict
from uuid import UUID
from pydantic import BaseModel


# Player Schemas
class PlayerCreate(BaseModel):
    """Schema for creating a new player"""
    name: str
    is_admin: bool = False


class PlayerResponse(BaseModel):
    """Schema for player response"""
    id: int
    player_id: str
    name: str
    is_admin: bool
    created_at: str


class PlayerTicketCreate(BaseModel):
    """Schema for creating tickets for a player"""
    player_id: str
    count: int = 1
    session_code: Optional[str] = None


class PlayerTicketResponse(BaseModel):
    """Schema for player ticket response"""
    ticket_id: UUID
    player_id: str
    grid: List[List[Optional[int]]]
    strikes: Dict[str, bool]
    created_at: str
    updated_at: str


class TicketStrike(BaseModel):
    """Schema for striking numbers on ticket"""
    ticket_id: UUID
    row: int
    col: int
    strike: bool  # True to strike, False to unstrike


# Game Session Schemas
class GameSessionCreate(BaseModel):
    """Schema for creating a game session"""
    admin_player_id: str


class GameSessionResponse(BaseModel):
    """Schema for game session response"""
    id: int
    session_code: str
    admin_player_id: str
    current_number: Optional[int]
    called_numbers: List[int]
    remaining_numbers: List[int]
    is_active: bool
    created_at: str
    updated_at: str


class GameSessionState(BaseModel):
    """Schema for game session state"""
    session_code: str
    current_number: Optional[int]
    called_numbers: List[int]
    remaining_numbers: List[int]
    players_count: int
    tickets_count: int
    is_active: bool


class NumberCall(BaseModel):
    """Schema for calling a number in a session"""
    session_code: str


class NumberCallResponse(BaseModel):
    """Schema for number call response"""
    session_code: str
    called_number: int
    remaining_count: int
    all_called_numbers: List[int]


# Admin Schemas
class AdminTicketGenerate(BaseModel):
    """Schema for admin generating tickets for players"""
    session_code: str
    player_id: str
    count: int = 1


class AdminSessionInfo(BaseModel):
    """Schema for admin session information"""
    session_code: str
    admin_player_id: str
    players: List[PlayerResponse]
    total_tickets: int
    current_number: Optional[int]
    called_numbers: List[int]
    remaining_numbers: List[int]
    is_active: bool


# General Response Schemas
class SuccessResponse(BaseModel):
    """General success response"""
    success: bool
    message: str
    data: Optional[Dict] = None


class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = False
    error: str
    details: Optional[str] = None
