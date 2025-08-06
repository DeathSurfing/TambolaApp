from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, JSON, Column
from pydantic import BaseModel


class GameState(BaseModel):
    """Represents the current state of a bingo game"""
    current_number: Optional[int] = None
    picked_numbers: List[int] = []
    remaining_numbers: List[int] = []


class NumberSession(SQLModel, table=True):
    """Database model for number picking sessions"""
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    history: List[int] = Field(default=[], sa_column=Column(JSON))
    remaining: List[int] = Field(default=[], sa_column=Column(JSON))
    current_number: Optional[int] = Field(default=None)
    created_at: Optional[str] = Field(default=None)
    updated_at: Optional[str] = Field(default=None)
