from sqlmodel import SQLModel, create_engine, Session
from models.ticket import Ticket
from models.game import NumberSession
from models.player import Player, PlayerTicket, GameSession


# SQLite database URL
DATABASE_URL = "sqlite:///./bingo.db"

# Create engine
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session
