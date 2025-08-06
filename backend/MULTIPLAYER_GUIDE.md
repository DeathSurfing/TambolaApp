# Multiplayer Bingo API Quick Guide

## 🚀 Key Features

✅ **Short Player IDs**: Players get unique 6-character IDs (e.g., "ABC123")  
✅ **Short Session Codes**: Game sessions have 4-character codes (e.g., "GAME")  
✅ **Persistent Ticket Striking**: Player strikes are saved to database  
✅ **Admin Controls**: Admins can manage sessions and generate tickets for any player  
✅ **Real-time State**: Session state is synchronized across all players  
✅ **URL-friendly IDs**: Use player IDs and session codes directly in URLs  

## 🎯 Quick Start

### 1. Create Players
```bash
# Create admin
POST /api/players/create
{"name": "Admin Alice", "is_admin": true}
# → Returns: {"player_id": "ABC123", ...}

# Create player  
POST /api/players/create
{"name": "Player Bob", "is_admin": false}
# → Returns: {"player_id": "XYZ789", ...}
```

### 2. Create Game Session
```bash
POST /api/sessions/create
{"admin_player_id": "ABC123"}
# → Returns: {"session_code": "GAME", ...}
```

### 3. Generate & Assign Tickets
```bash
# Admin generates tickets for any player
POST /api/admin/generate-tickets?admin_player_id=ABC123
{"session_code": "GAME", "player_id": "XYZ789", "count": 3}
```

### 4. Join Session
```bash
POST /api/sessions/GAME/join?player_id=XYZ789
```

### 5. Game Play
```bash
# Admin calls numbers
POST /api/sessions/GAME/call-number
# → Returns: {"called_number": 47, ...}

# Players strike their tickets
POST /api/players/tickets/strike
{"ticket_id": "uuid", "row": 0, "col": 4, "strike": true}

# Check session state
GET /api/sessions/GAME
# → Returns: current_number, called_numbers, player_count, etc.
```

## 🔗 URL Patterns

- **Player Profile**: `/game/player/{player_id}` (e.g., `/game/player/ABC123`)
- **Game Session**: `/game/session/{session_code}` (e.g., `/game/session/GAME`)
- **Admin Panel**: `/admin/{session_code}` (e.g., `/admin/GAME`)

## 🛡️ Admin Powers

Admins can:
- Generate tickets for any player: `POST /api/admin/generate-tickets`
- View all players: `GET /api/admin/players`  
- View all sessions: `GET /api/admin/sessions`
- Get detailed session info: `GET /api/admin/session/{code}`
- Delete players: `DELETE /api/admin/player/{id}`
- Promote players to admin: `POST /api/admin/player/{id}/make-admin`
- Reset sessions: `POST /api/sessions/{code}/reset`

## 📊 Database Schema

```
Player (player_id, name, is_admin)
  ↓
PlayerTicket (ticket_id, player_id, grid, strikes)
  ↓  
GameSession (session_code, admin_player_id, called_numbers)
```

## 🎮 Game State Management

Each player's ticket strikes are stored as:
```json
{
  "strikes": {
    "0-4": true,  // Row 0, Col 4 is struck
    "1-2": true,  // Row 1, Col 2 is struck
    "2-8": false  // Row 2, Col 8 is unstruk
  }
}
```

Session state includes:
- Current called number
- All called numbers history
- Remaining numbers
- Player count and ticket count
- Active/inactive status

## 🧪 Testing

Run comprehensive tests:
```bash
python test_multiplayer_api.py
```

This will:
1. Create admin and players
2. Create game session
3. Generate and assign tickets  
4. Join session
5. Call numbers and strike tickets
6. Test admin functions
7. Verify all state persistence

## 🌐 Frontend Integration

Frontend can use the short IDs for:
- **Player URLs**: `yourapp.com/player/ABC123`
- **Game URLs**: `yourapp.com/game/GAME`  
- **API Calls**: Direct use in REST endpoints
- **State Sync**: Poll `/api/sessions/{code}` for updates
- **Real-time**: WebSocket integration ready (future enhancement)
