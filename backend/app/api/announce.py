from fastapi import APIRouter, HTTPException

from schemas.game import AnnounceResponse
from utils.announcer import number_to_words

router = APIRouter()


@router.get("/{number}", response_model=AnnounceResponse)
def announce_number(number: int) -> AnnounceResponse:
    """Convert number to spoken form"""
    
    if not 1 <= number <= 90:
        raise HTTPException(status_code=400, detail="Number must be between 1 and 90")
    
    spoken = number_to_words(number)
    
    return AnnounceResponse(spoken=spoken)
