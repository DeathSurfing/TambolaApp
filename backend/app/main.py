from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from database import create_db_and_tables
from app.api import tickets, game, announce, players, sessions, admin
from utils.cleanup import periodic_cleanup_task, manual_cleanup

# Create FastAPI app
app = FastAPI(
    title="Bingo Game API",
    description="FastAPI backend for Bingo game with ticket generation and number picking",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tambola.adityavikram.dev"],  # 👈 Your deployed frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(game.router, prefix="/api/game", tags=["game"])
app.include_router(announce.router, prefix="/api/announce", tags=["announce"])

# Multiplayer routers
app.include_router(players.router, prefix="/api/players", tags=["players"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.on_event("startup")
def on_startup():
    """Create database tables and start background tasks on startup"""
    create_db_and_tables()
    
    # Start periodic cleanup task in background
    asyncio.create_task(periodic_cleanup_task())


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Multiplayer Bingo Game API",
        "version": "2.0.0 - Now with Multiplayer Support!",
        "docs": "/docs",
        "features": [
            "🎫 Ticket Generation with proper bingo constraints",
            "👥 Multiplayer support with short player IDs", 
            "🎮 Game sessions with unique session codes",
            "✏️ Real-time ticket striking",
            "🔊 Number announcements",
            "🛡️ Admin controls and management",
            "💾 Persistent state with SQLite database"
        ],
        "endpoints": {
            "legacy": {
                "tickets": "/api/tickets/generate",
                "game_start": "/api/game/start",
                "game_pick": "/api/game/pick", 
                "game_state": "/api/game/state",
                "game_reset": "/api/game/reset",
                "announce": "/api/announce/{number}"
            },
            "multiplayer": {
                "create_player": "/api/players/create",
                "get_player": "/api/players/{player_id}",
                "player_tickets": "/api/players/{player_id}/tickets",
                "strike_ticket": "/api/players/tickets/strike",
                "create_session": "/api/sessions/create",
                "join_session": "/api/sessions/{session_code}/join",
                "call_number": "/api/sessions/{session_code}/call-number",
                "session_state": "/api/sessions/{session_code}"
            },
            "admin": {
                "generate_tickets": "/api/admin/generate-tickets",
                "session_info": "/api/admin/session/{session_code}",
                "all_players": "/api/admin/players",
                "all_sessions": "/api/admin/sessions"
            }
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/admin/cleanup")
def trigger_manual_cleanup():
    """Manually trigger database cleanup (for admin use)"""
    return manual_cleanup()
