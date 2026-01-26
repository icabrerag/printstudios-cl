#!/usr/bin/env python3
"""
Test to track session state progression
"""

import requests
import json

BASE_URL = "https://printstudios-app.preview.emergentagent.com/api"

def track_session_state():
    print("🔍 Tracking Session State Progression")
    print("=" * 50)
    
    # Start session
    response = requests.post(f"{BASE_URL}/chat/start", json={"guestId": "state-test"})
    data = response.json()
    session_id = data['sessionId']
    print(f"Initial: State={data['state']}, NextState={data.get('nextState', 'N/A')}")
    
    # Get session after start
    response = requests.get(f"{BASE_URL}/chat/session/{session_id}")
    session_data = response.json()
    print(f"Session after start: State={session_data['state']}")
    
    # Send "A"
    print(f"\n📤 Sending: 'A'")
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "A"})
    data = response.json()
    print(f"Response: State={data['state']}")
    
    # Get session after A
    response = requests.get(f"{BASE_URL}/chat/session/{session_id}")
    session_data = response.json()
    print(f"Session after A: State={session_data['state']}")
    print(f"Session data: {session_data.get('data', {})}")
    
    # Send description
    print(f"\n📤 Sending: 'Necesito imprimir una carcasa para Arduino'")
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "Necesito imprimir una carcasa para Arduino"})
    data = response.json()
    print(f"Response: State={data['state']}")
    
    # Get session after description
    response = requests.get(f"{BASE_URL}/chat/session/{session_id}")
    session_data = response.json()
    print(f"Session after description: State={session_data['state']}")
    print(f"Session data: {session_data.get('data', {})}")
    
    # Send "Sí"
    print(f"\n📤 Sending: 'Sí'")
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "Sí"})
    data = response.json()
    print(f"Response: State={data['state']}")
    
    # Get session after Sí
    response = requests.get(f"{BASE_URL}/chat/session/{session_id}")
    session_data = response.json()
    print(f"Session after Sí: State={session_data['state']}")
    print(f"Session data: {session_data.get('data', {})}")

if __name__ == "__main__":
    track_session_state()