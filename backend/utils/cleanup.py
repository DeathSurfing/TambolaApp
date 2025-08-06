import asyncio
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, select, delete
from database import engine
from models.player import GameSession, PlayerTicket, Player

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def cleanup_finished_games(hours_threshold: int = 24) -> int:
    """
    Clean up finished games older than specified hours.
    
    Args:
        hours_threshold: Games older than this many hours will be deleted (default: 24)
        
    Returns:
        Number of games cleaned up
    """
    cutoff_time = datetime.now() - timedelta(hours=hours_threshold)
    cutoff_time_str = cutoff_time.isoformat()
    
    with Session(engine) as session:
        # Find inactive sessions older than threshold
        stmt = select(GameSession).where(
            GameSession.is_active == False,
            GameSession.updated_at < cutoff_time_str
        )
        
        inactive_sessions = session.exec(stmt).all()
        
        if not inactive_sessions:
            logger.info("No finished games to clean up")
            return 0
        
        games_cleaned = 0
        
        for game_session in inactive_sessions:
            try:
                # Delete associated tickets first (foreign key constraint)
                ticket_delete_stmt = delete(PlayerTicket).where(
                    PlayerTicket.game_session_id == game_session.id
                )
                session.exec(ticket_delete_stmt)
                
                # Delete the game session
                session.delete(game_session)
                
                games_cleaned += 1
                logger.info(f"Cleaned up game session: {game_session.session_code}")
                
            except Exception as e:
                logger.error(f"Error cleaning up game session {game_session.session_code}: {e}")
                session.rollback()
                continue
        
        # Commit all deletions
        session.commit()
        
        logger.info(f"Successfully cleaned up {games_cleaned} finished games")
        return games_cleaned


def cleanup_orphaned_players() -> int:
    """
    Clean up players who have no active sessions and no tickets.
    
    Returns:
        Number of players cleaned up
    """
    with Session(engine) as session:
        # Find players with no game sessions and no tickets
        stmt = select(Player).where(
            ~Player.game_sessions.any(),  # No game sessions
            ~Player.tickets.any(),        # No tickets
            Player.is_admin == False      # Not an admin
        )
        
        orphaned_players = session.exec(stmt).all()
        
        if not orphaned_players:
            logger.info("No orphaned players to clean up")
            return 0
        
        players_cleaned = 0
        
        for player in orphaned_players:
            try:
                session.delete(player)
                players_cleaned += 1
                logger.info(f"Cleaned up orphaned player: {player.name} ({player.player_id})")
                
            except Exception as e:
                logger.error(f"Error cleaning up player {player.player_id}: {e}")
                session.rollback()
                continue
        
        session.commit()
        
        logger.info(f"Successfully cleaned up {players_cleaned} orphaned players")
        return players_cleaned


async def periodic_cleanup_task():
    """
    Background task that runs cleanup every 12 hours.
    """
    while True:
        try:
            logger.info("Starting periodic database cleanup...")
            
            # Clean up finished games older than 24 hours
            games_cleaned = cleanup_finished_games(hours_threshold=24)
            
            # Clean up orphaned players
            players_cleaned = cleanup_orphaned_players()
            
            logger.info(f"Cleanup completed: {games_cleaned} games, {players_cleaned} players removed")
            
        except Exception as e:
            logger.error(f"Error during periodic cleanup: {e}")
        
        # Wait 12 hours before next cleanup (43200 seconds)
        await asyncio.sleep(12 * 60 * 60)


def manual_cleanup():
    """
    Manual cleanup function that can be called directly.
    Useful for testing or one-time cleanup operations.
    """
    logger.info("Running manual database cleanup...")
    
    games_cleaned = cleanup_finished_games(hours_threshold=24)
    players_cleaned = cleanup_orphaned_players()
    
    logger.info(f"Manual cleanup completed: {games_cleaned} games, {players_cleaned} players removed")
    
    return {
        "games_cleaned": games_cleaned,
        "players_cleaned": players_cleaned,
        "timestamp": datetime.now().isoformat()
    }
