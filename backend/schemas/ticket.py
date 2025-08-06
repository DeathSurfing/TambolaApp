from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class TicketGenerateRequest(BaseModel):
    """Request schema for generating tickets"""
    count: int = 1


class TicketResponse(BaseModel):
    """Response schema for a single ticket"""
    id: UUID
    grid: List[List[Optional[int]]]


class TicketGenerateResponse(BaseModel):
    """Response schema for ticket generation"""
    tickets: List[List[List[Optional[int]]]]
