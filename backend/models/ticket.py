from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, JSON, Column
from pydantic import BaseModel


class Cell(BaseModel):
    """Represents a cell in a bingo ticket grid"""
    value: Optional[int] = None  # None means blank


class TicketGrid(BaseModel):
    """Represents the grid structure of a bingo ticket"""
    grid: List[List[Optional[int]]]


class Ticket(SQLModel, table=True):
    """Database model for bingo tickets"""
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    grid: List[List[Optional[int]]] = Field(sa_column=Column(JSON))
    created_at: Optional[str] = Field(default=None)
