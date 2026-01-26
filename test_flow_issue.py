#!/usr/bin/env python3
"""
Targeted test to understand the chatbot flow issue
"""

import requests
import json

BASE_URL = "https://printstudios-app.preview.emergentagent.com/api"

def test_specific_flow():
    print("🔍 Testing Specific Chatbot Flow Issue")
    print("=" * 50)
    
    # Start session
    response = requests.post(f"{BASE_URL}/chat/start", json={"guestId": "test-flow"})
    session_id = response.json()['sessionId']
    print(f"Session: {session_id}")
    
    # Step 1: Intent A
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "A"})
    data = response.json()
    print(f"\nAfter 'A': State={data['state']}, Data={data.get('data', {})}")
    
    # Step 2: Description
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "Necesito imprimir una carcasa para Arduino"})
    data = response.json()
    print(f"After description: State={data['state']}, Data={data.get('data', {})}")
    
    # Step 3: File check - this is where the issue is
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id, "message": "Sí"})
    data = response.json()
    print(f"After 'Sí': State={data['state']}, Data={data.get('data', {})}")
    print(f"hasFile value: {data.get('data', {}).get('hasFile', 'NOT SET')}")
    
    # Let's try with "No" to see the difference
    print("\n" + "="*30)
    print("Testing with 'No' response:")
    
    # Start new session
    response = requests.post(f"{BASE_URL}/chat/start", json={"guestId": "test-flow-2"})
    session_id2 = response.json()['sessionId']
    
    # Intent A
    requests.post(f"{BASE_URL}/chat/message", 
                 json={"sessionId": session_id2, "message": "A"})
    
    # Description
    requests.post(f"{BASE_URL}/chat/message", 
                 json={"sessionId": session_id2, "message": "Necesito imprimir una carcasa para Arduino"})
    
    # File check with "No"
    response = requests.post(f"{BASE_URL}/chat/message", 
                           json={"sessionId": session_id2, "message": "No"})
    data = response.json()
    print(f"After 'No': State={data['state']}, Data={data.get('data', {})}")
    print(f"hasFile value: {data.get('data', {}).get('hasFile', 'NOT SET')}")

if __name__ == "__main__":
    test_specific_flow()