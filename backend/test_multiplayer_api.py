#!/usr/bin/env python3
"""
Comprehensive test script for Multiplayer Bingo API
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print(f"✅ Root: {response.status_code}")
    data = response.json()
    print(f"   Version: {data['version']}")
    print(f"   Features: {len(data['features'])}")

def test_create_players():
    """Test creating players"""
    print("\n🎭 Testing Player Creation")
    
    # Create admin player
    admin_data = {"name": "Admin Alice", "is_admin": True}
    response = requests.post(f"{BASE_URL}/api/players/create", json=admin_data)
    print(f"   Admin creation: {response.status_code}")
    if response.status_code == 200:
        admin = response.json()
        print(f"   Admin ID: {admin['player_id']} (Name: {admin['name']})")
        
    # Create regular players
    players = []
    for name in ["Bob Player", "Carol Gamer", "Dave User"]:
        player_data = {"name": name, "is_admin": False}
        response = requests.post(f"{BASE_URL}/api/players/create", json=player_data)
        if response.status_code == 200:
            player = response.json()
            players.append(player)
            print(f"   Player created: {player['player_id']} ({player['name']})")
    
    return admin, players

def test_create_session(admin_player_id):
    """Test creating a game session"""
    print("\n🎮 Testing Game Session Creation")
    
    session_data = {"admin_player_id": admin_player_id}
    response = requests.post(f"{BASE_URL}/api/sessions/create", json=session_data)
    print(f"   Session creation: {response.status_code}")
    if response.status_code == 200:
        session = response.json()
        print(f"   Session Code: {session['session_code']}")
        print(f"   Admin: {session['admin_player_id']}")
        return session
    return None

def test_generate_tickets(players, session_code=None):
    """Test generating tickets for players"""
    print("\n🎫 Testing Ticket Generation")
    
    player_tickets = {}
    for player in players:
        ticket_data = {
            "player_id": player['player_id'],
            "count": 2,
            "session_code": session_code
        }
        response = requests.post(
            f"{BASE_URL}/api/players/{player['player_id']}/tickets", 
            json=ticket_data
        )
        print(f"   Tickets for {player['name']}: {response.status_code}")
        if response.status_code == 200:
            tickets = response.json()
            player_tickets[player['player_id']] = tickets
            print(f"     Generated {len(tickets)} tickets")
            
            # Show a sample ticket
            if tickets:
                grid = tickets[0]['grid']
                print("     Sample ticket (first row):", [cell for cell in grid[0] if cell is not None])
    
    return player_tickets

def test_join_session(session_code, players):
    """Test players joining a session"""
    print(f"\n🚪 Testing Session Join (Code: {session_code})")
    
    for player in players:
        response = requests.post(
            f"{BASE_URL}/api/sessions/{session_code}/join",
            params={"player_id": player['player_id']}
        )
        print(f"   {player['name']} join: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"     Tickets added: {result['data']['tickets_added']}")

def test_strike_tickets(player_tickets):
    """Test striking numbers on tickets"""
    print("\n✏️ Testing Ticket Striking")
    
    # Strike some numbers on the first player's first ticket
    if player_tickets:
        first_player_id = list(player_tickets.keys())[0]
        first_ticket = player_tickets[first_player_id][0]
        ticket_id = first_ticket['ticket_id']
        
        # Find some numbers to strike
        grid = first_ticket['grid']
        strikes_made = 0
        
        for row in range(3):
            for col in range(9):
                if grid[row][col] is not None and strikes_made < 3:
                    strike_data = {
                        "ticket_id": ticket_id,
                        "row": row,
                        "col": col,
                        "strike": True
                    }
                    response = requests.post(
                        f"{BASE_URL}/api/players/tickets/strike",
                        json=strike_data
                    )
                    if response.status_code == 200:
                        result = response.json()
                        print(f"   Struck number: {result['message']}")
                        strikes_made += 1

def test_call_numbers(session_code):
    """Test calling numbers in a session"""
    print(f"\n📢 Testing Number Calling (Session: {session_code})")
    
    called_numbers = []
    for i in range(5):  # Call 5 numbers
        response = requests.post(f"{BASE_URL}/api/sessions/{session_code}/call-number")
        print(f"   Call {i+1}: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            called_numbers.append(result['called_number'])
            print(f"     Called: {result['called_number']} (Remaining: {result['remaining_count']})")
    
    return called_numbers

def test_session_state(session_code):
    """Test getting session state"""
    print(f"\n📊 Testing Session State (Code: {session_code})")
    
    response = requests.get(f"{BASE_URL}/api/sessions/{session_code}")
    print(f"   Session state: {response.status_code}")
    if response.status_code == 200:
        state = response.json()
        print(f"     Current number: {state['current_number']}")
        print(f"     Players: {state['players_count']}")
        print(f"     Tickets: {state['tickets_count']}")
        print(f"     Called numbers: {len(state['called_numbers'])}")
        print(f"     Remaining: {len(state['remaining_numbers'])}")

def test_admin_functions(admin_player_id, session_code):
    """Test admin functions"""
    print(f"\n🛡️ Testing Admin Functions")
    
    # Get all players
    response = requests.get(f"{BASE_URL}/api/admin/players", params={"admin_player_id": admin_player_id})
    print(f"   Get all players: {response.status_code}")
    if response.status_code == 200:
        players = response.json()
        print(f"     Total players: {len(players)}")
    
    # Get session info
    response = requests.get(
        f"{BASE_URL}/api/admin/session/{session_code}",
        params={"admin_player_id": admin_player_id}
    )
    print(f"   Get session info: {response.status_code}")
    if response.status_code == 200:
        info = response.json()
        print(f"     Session players: {len(info['players'])}")
        print(f"     Total tickets: {info['total_tickets']}")

def test_announcer(called_numbers):
    """Test number announcer"""
    print(f"\n🔊 Testing Number Announcer")
    
    for number in called_numbers[:3]:  # Test first 3 called numbers
        response = requests.get(f"{BASE_URL}/api/announce/{number}")
        if response.status_code == 200:
            result = response.json()
            print(f"   {number} → '{result['spoken']}'")

def run_multiplayer_tests():
    """Run comprehensive multiplayer tests"""
    print("🧪 Testing Multiplayer Bingo API")
    print("=" * 50)
    
    try:
        # Basic tests
        test_root()
        
        # Create players
        admin, players = test_create_players()
        if not admin or not players:
            print("❌ Failed to create players")
            return
        
        # Create session
        session = test_create_session(admin['player_id'])
        if not session:
            print("❌ Failed to create session")
            return
        
        session_code = session['session_code']
        
        # Generate tickets
        player_tickets = test_generate_tickets(players, session_code)
        
        # Join session
        test_join_session(session_code, players)
        
        # Strike some tickets
        test_strike_tickets(player_tickets)
        
        # Call numbers
        called_numbers = test_call_numbers(session_code)
        
        # Check session state
        test_session_state(session_code)
        
        # Test admin functions
        test_admin_functions(admin['player_id'], session_code)
        
        # Test announcer
        if called_numbers:
            test_announcer(called_numbers)
        
        print("\n✅ All multiplayer tests completed successfully!")
        
        # Print summary
        print("\n📋 Test Summary:")
        print(f"   Admin Player: {admin['player_id']} ({admin['name']})")
        print(f"   Regular Players: {len(players)}")
        print(f"   Session Code: {session_code}")
        print(f"   Numbers Called: {len(called_numbers) if called_numbers else 0}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server.")
        print("Make sure the server is running with: python run.py")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    run_multiplayer_tests()
