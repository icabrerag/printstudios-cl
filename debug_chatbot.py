#!/usr/bin/env python3
"""
Debug chatbot flow to understand why quote request is not being created
"""

import requests
import json

BASE_URL = "https://printstudios-app.preview.emergentagent.com/api"

def debug_chatbot_flow():
    print("🔍 Debugging Chatbot Flow")
    print("=" * 50)
    
    # Start session
    print("\n1. Starting chat session...")
    response = requests.post(f"{BASE_URL}/chat/start", json={"guestId": "debug-test"})
    if response.status_code != 200:
        print(f"❌ Failed to start session: {response.status_code}")
        return
    
    data = response.json()
    session_id = data['sessionId']
    print(f"✅ Session started: {session_id}")
    print(f"Initial state: {data['state']}")
    print(f"Bot message: {data['message'][:100]}...")
    
    # Define the complete flow
    messages = [
        ("A", "Intent selection"),
        ("Necesito imprimir una carcasa para Arduino", "Description"),
        ("Sí", "Has file confirmation"),
        ("10x8x3 cm", "Dimensions"),
        ("funcional interior", "Usage"),
        ("2", "Quantity"),
        ("PETG", "Material"),
        ("Negro", "Color"),
        ("Estándar", "Finish"),
        ("Normal", "Deadline"),
        ("Retiro en taller", "Delivery"),
        ("abierto", "Budget"),
        ("Juan Pérez\njuan@email.com\n+56912345678", "Contact"),
        ("confirmar", "Confirmation")
    ]
    
    for i, (message, step_name) in enumerate(messages, 2):
        print(f"\n{i}. Sending: '{message}' ({step_name})")
        
        response = requests.post(f"{BASE_URL}/chat/message", 
                               json={"sessionId": session_id, "message": message})
        
        if response.status_code != 200:
            print(f"❌ Failed at step {step_name}: {response.status_code}")
            print(f"Response: {response.text}")
            break
        
        data = response.json()
        print(f"State: {data['state']}")
        print(f"Is Complete: {data.get('isComplete', False)}")
        print(f"Quote Request ID: {data.get('quoteRequestId', 'None')}")
        print(f"Bot response: {data['message'][:150]}...")
        
        if data.get('isComplete'):
            print(f"🎉 Flow completed! Quote request: {data.get('quoteRequestId')}")
            break
        
        # Show current data
        if 'data' in data and data['data']:
            print(f"Current data keys: {list(data['data'].keys())}")
    
    # Get final session state
    print(f"\n📋 Getting final session state...")
    response = requests.get(f"{BASE_URL}/chat/session/{session_id}")
    if response.status_code == 200:
        session_data = response.json()
        print(f"Final state: {session_data['state']}")
        print(f"Total messages: {len(session_data['messages'])}")
        print(f"Session status: {session_data.get('status', 'unknown')}")
        if 'quoteRequestId' in session_data:
            print(f"Quote Request ID in session: {session_data['quoteRequestId']}")

if __name__ == "__main__":
    debug_chatbot_flow()