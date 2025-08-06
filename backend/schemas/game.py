from typing import Optional, List
from pydantic import BaseModel


class GameStartResponse(BaseModel):
    """Response schema for starting a new game"""
    message: str
    session_id: str


class GamePickResponse(BaseModel):
    """Response schema for picking a number"""
    number: int
    history: List[int]


class GameStateResponse(BaseModel):
    """Response schema for game state"""
    current_number: Optional[int]
    picked_numbers: List[int]
    remaining_numbers: List[int]


class GameResetResponse(BaseModel):
    """Response schema for game reset"""
    message: str


class AnnounceResponse(BaseModel):
    """Response schema for number announcement"""
    spoken: str
