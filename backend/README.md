# Multiplayer Bingo Game FastAPI Backend

A comprehensive FastAPI backend for a multiplayer Bingo (Tambola) game system with ticket generation, number picking, player management, and persistent state management.

## Features

- 🎫 **Ticket Generation**: Generate valid bingo tickets (9x3 grid) with proper constraints
- 👥 **Multiplayer Support**: Multiple players with unique short IDs (e.g., "ABC123")
- 🎮 **Game Sessions**: Create and manage game sessions with short codes (e.g., "GAME")
- ✏️ **Ticket Striking**: Players can strike numbers on their tickets with persistent state
- 🔢 **Number Picker**: Random number picking system with history tracking
- 🔊 **Voice Announcer**: Convert numbers to spoken words
- 🛡️ **Admin Controls**: Admin players can manage sessions and generate tickets for others
- 🗄️ **Persistent Database**: SQLite database with comprehensive state management
- 📚 **API Documentation**: Auto-generated OpenAPI/Swagger docs
- 🌐 **Real-time Updates**: Session state synchronization across players

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python run.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### 👥 Player Management
- `POST /api/players/create` - Create a new player
  - Input: `{"name": "John Doe", "is_admin": false}`
  - Returns: Player with unique short ID (e.g., "ABC123")
- `GET /api/players/{player_id}` - Get player information
- `GET /api/players/{player_id}/tickets` - Get all tickets for a player
- `POST /api/players/{player_id}/tickets` - Generate tickets for a player
- `POST /api/players/tickets/strike` - Strike/unstrike numbers on tickets

### 🎮 Game Sessions
- `POST /api/sessions/create` - Create a new multiplayer game session
  - Input: `{"admin_player_id": "ABC123"}`
  - Returns: Session with short code (e.g., "GAME")
- `GET /api/sessions/{session_code}` - Get session state and statistics
- `POST /api/sessions/{session_code}/join` - Join a player to a session
- `POST /api/sessions/{session_code}/call-number` - Call next random number
- `POST /api/sessions/{session_code}/reset` - Reset session (admin only)
- `POST /api/sessions/{session_code}/deactivate` - Deactivate session (admin only)

### 🛡️ Admin Controls
- `POST /api/admin/generate-tickets` - Admin generate tickets for any player
- `GET /api/admin/session/{session_code}` - Get detailed session info
- `GET /api/admin/players` - Get all players (admin only)
- `GET /api/admin/sessions` - Get all sessions (admin only)
- `DELETE /api/admin/player/{player_id}` - Delete player (admin only)
- `POST /api/admin/player/{player_id}/make-admin` - Promote to admin

### 🎫 Legacy Ticket Generation
- `POST /api/tickets/generate` - Generate bingo tickets
  - Input: `{"count": 6}`
  - Output: List of ticket grids

### 🔢 Legacy Number Picker
- `POST /api/game/start` - Start a new game session
- `POST /api/game/pick` - Pick next random number
- `GET /api/game/state` - Get current game state
- `POST /api/game/reset` - Reset the game

### 🔊 Voice Announcer
- `GET /api/announce/{number}` - Get spoken form of number
  - Example: `/api/announce/47` returns `{"spoken": "forty-seven"}`

### 📚 Documentation
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative documentation
- `GET /` - API overview and endpoints list

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   └── api/
│       ├── tickets.py   # Ticket generation endpoints
│       ├── game.py      # Game logic endpoints
│       └── announce.py  # Voice announcer endpoints
├── models/
│   ├── ticket.py        # Ticket database models
│   └── game.py          # Game state models
├── schemas/
│   ├── ticket.py        # Request/response schemas
│   └── game.py          # Game schemas
├── utils/
│   ├── generator.py     # Ticket generation logic
│   └── announcer.py     # Number to words conversion
├── database.py          # Database configuration
├── requirements.txt     # Python dependencies
└── run.py              # Server startup script
```

## Bingo Ticket Format

- **Grid**: 9 columns × 3 rows
- **Numbers per row**: Exactly 5 numbers, 4 blanks
- **Total numbers**: 15 per ticket
- **Number range**: 1-90
- **Column constraints**:
  - Column 1: 1-10
  - Column 2: 11-20
  - Column 3: 21-30
  - ...
  - Column 9: 81-90
- **Uniqueness**: No duplicate numbers within a ticket

## Database Schema

The application uses SQLite with the following tables:

### Core Tables
- `player`: Player information with short IDs
- `playerticket`: Player tickets with strike information
- `gamesession`: Multiplayer game sessions
- `ticket`: Legacy ticket storage
- `numbersession`: Legacy game sessions

### Key Relationships
- Players can have multiple tickets
- Tickets belong to players and can be assigned to game sessions
- Game sessions track called numbers and player participation
- Ticket strikes are stored per position ("row-col" format)

## Multiplayer Game Flow

### 1. Setup Phase
1. **Create Admin**: Create an admin player
2. **Create Players**: Create regular players
3. **Create Session**: Admin creates a game session
4. **Generate Tickets**: Generate tickets for players
5. **Join Session**: Players join the session

### 2. Game Phase
1. **Call Numbers**: Admin calls random numbers
2. **Strike Tickets**: Players mark their tickets
3. **Check State**: Monitor game progress
4. **Declare Winners**: Players claim wins

### 3. Management
- **Reset Session**: Start new game with same players
- **Admin Controls**: Manage players and sessions
- **Session Analytics**: Track game statistics

## API Usage Examples

### Multiplayer Workflow

#### 1. Create Players
```bash
# Create admin
curl -X POST "http://localhost:8000/api/players/create" \
     -H "Content-Type: application/json" \
     -d '{"name": "Admin Alice", "is_admin": true}'
# Returns: {"player_id": "ABC123", "name": "Admin Alice", "is_admin": true}

# Create regular player
curl -X POST "http://localhost:8000/api/players/create" \
     -H "Content-Type: application/json" \
     -d '{"name": "Player Bob", "is_admin": false}'
# Returns: {"player_id": "XYZ789", "name": "Player Bob", "is_admin": false}
```

#### 2. Create Game Session
```bash
curl -X POST "http://localhost:8000/api/sessions/create" \
     -H "Content-Type: application/json" \
     -d '{"admin_player_id": "ABC123"}'
# Returns: {"session_code": "GAME", "admin_player_id": "ABC123", ...}
```

#### 3. Generate Tickets
```bash
# Generate tickets for a player
curl -X POST "http://localhost:8000/api/players/XYZ789/tickets" \
     -H "Content-Type: application/json" \
     -d '{"player_id": "XYZ789", "count": 3, "session_code": "GAME"}'
```

#### 4. Join Session
```bash
curl -X POST "http://localhost:8000/api/sessions/GAME/join?player_id=XYZ789"
```

#### 5. Call Numbers
```bash
# Admin calls next number
curl -X POST "http://localhost:8000/api/sessions/GAME/call-number"
# Returns: {"called_number": 47, "remaining_count": 89, ...}
```

#### 6. Strike Tickets
```bash
# Player strikes number on their ticket
curl -X POST "http://localhost:8000/api/players/tickets/strike" \
     -H "Content-Type: application/json" \
     -d '{"ticket_id": "ticket-uuid", "row": 0, "col": 4, "strike": true}'
```

#### 7. Check Session State
```bash
curl "http://localhost:8000/api/sessions/GAME"
# Returns: session state with players, tickets, called numbers
```

### Admin Operations

#### Generate Tickets for Any Player
```bash
curl -X POST "http://localhost:8000/api/admin/generate-tickets" \
     -H "Content-Type: application/json" \
     -d '{"session_code": "GAME", "player_id": "XYZ789", "count": 2}' \
     -G -d "admin_player_id=ABC123"
```

#### Get Session Analytics
```bash
curl "http://localhost:8000/api/admin/session/GAME?admin_player_id=ABC123"
```

### Legacy API (Single Player)

#### Generate Tickets
```bash
curl -X POST "http://localhost:8000/api/tickets/generate" \
     -H "Content-Type: application/json" \
     -d '{"count": 6}'
```

#### Game Operations
```bash
# Start game
curl -X POST "http://localhost:8000/api/game/start"

# Pick number
curl -X POST "http://localhost:8000/api/game/pick"

# Get state
curl "http://localhost:8000/api/game/state"

# Number pronunciation
curl "http://localhost:8000/api/announce/47"
```

## Testing

Run the comprehensive test suite:

```bash
# Test all endpoints
python test_api.py

# Test multiplayer functionality
python test_multiplayer_api.py
```

## Development

The server runs with auto-reload enabled in development mode. Any changes to the code will automatically restart the server.

Visit `http://localhost:8000/docs` to interact with the API using the built-in Swagger UI.
