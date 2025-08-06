#!/usr/bin/env python3
"""
Test script to verify all API endpoints work correctly
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health: {response.status_code} - {response.json()}")

def test_root():
    """Test root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print(f"Root: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_ticket_generation():
    """Test ticket generation"""
    response = requests.post(
        f"{BASE_URL}/api/tickets/generate",
        json={"count": 2}
    )
    print(f"Ticket Generation: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Generated {len(data['tickets'])} tickets")
        print("Sample ticket (first ticket, first row):", data['tickets'][0][0])

def test_game_flow():
    """Test complete game flow"""
    # Start game
    response = requests.post(f"{BASE_URL}/api/game/start")
    print(f"Game Start: {response.status_code} - {response.json()}")
    
    # Pick a number
    response = requests.post(f"{BASE_URL}/api/game/pick")
    print(f"Pick Number: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Picked number: {data['number']}")
        print(f"History length: {len(data['history'])}")
    
    # Get game state
    response = requests.get(f"{BASE_URL}/api/game/state")
    print(f"Game State: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Current number: {data['current_number']}")
        print(f"Picked numbers: {len(data['picked_numbers'])}")
        print(f"Remaining numbers: {len(data['remaining_numbers'])}")
    
    # Reset game
    response = requests.post(f"{BASE_URL}/api/game/reset")
    print(f"Game Reset: {response.status_code} - {response.json()}")

def test_announcer():
    """Test number announcer"""
    numbers = [1, 23, 47, 55, 90]
    for num in numbers:
        response = requests.get(f"{BASE_URL}/api/announce/{num}")
        if response.status_code == 200:
            print(f"Announce {num}: {response.json()['spoken']}")

def run_tests():
    """Run all tests"""
    print("🧪 Testing Bingo API Endpoints")
    print("=" * 40)
    
    try:
        test_health()
        print()
        
        test_root()
        print()
        
        test_ticket_generation()
        print()
        
        test_game_flow()
        print()
        
        test_announcer()
        print()
        
        print("✅ All tests completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server.")
        print("Make sure the server is running with: python run.py")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    run_tests()
