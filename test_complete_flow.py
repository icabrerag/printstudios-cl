#!/usr/bin/env python3
"""
Test the chatbot flow with a complete working example
"""

import requests
import json
import time

BASE_URL = "https://printstudios-app.preview.emergentagent.com/api"

def test_complete_working_flow():
    print("🤖 Testing Complete Working Chatbot Flow")
    print("=" * 60)
    
    # Start session
    response = requests.post(f"{BASE_URL}/chat/start", json={"guestId": "complete-test"})
    if response.status_code != 200:
        print(f"❌ Failed to start session: {response.status_code}")
        return False
    
    data = response.json()
    session_id = data['sessionId']
    print(f"✅ Session started: {session_id}")
    
    # Define the complete flow with proper responses
    flow_steps = [
        ("A", "Intent: Print from 3D file"),
        ("Necesito imprimir una carcasa para Arduino", "Description"),
        ("Sí", "Has file: Yes"),
        ("10x8x3 cm", "Dimensions"),
        ("funcional interior", "Usage"),
        ("2", "Quantity"),
        ("PETG", "Material"),
        ("Negro", "Color"),
        ("Estándar", "Finish"),
        ("Normal", "Deadline"),
        ("Retiro en taller", "Delivery"),
        ("abierto", "Budget"),
        ("Juan Pérez\njuan@email.com\n+56912345678", "Contact info"),
        ("confirmar", "Final confirmation")
    ]
    
    quote_request_id = None
    
    for i, (message, description) in enumerate(flow_steps, 1):
        print(f"\n{i:2d}. {description}")
        print(f"    📤 Sending: '{message}'")
        
        response = requests.post(f"{BASE_URL}/chat/message", 
                               json={"sessionId": session_id, "message": message})
        
        if response.status_code != 200:
            print(f"    ❌ Failed: HTTP {response.status_code}")
            print(f"    Response: {response.text}")
            return False
        
        data = response.json()
        print(f"    📥 State: {data['state']}")
        print(f"    🤖 Bot: {data['message'][:80]}...")
        
        if data.get('isComplete'):
            quote_request_id = data.get('quoteRequestId')
            print(f"    🎉 FLOW COMPLETED! Quote Request ID: {quote_request_id}")
            break
        
        # Small delay to avoid overwhelming the server
        time.sleep(0.1)
    
    # Test admin endpoints if we have a quote request
    if quote_request_id:
        print(f"\n🔐 Testing Admin Endpoints...")
        
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/auth/login", 
                                     json={"email": "admin@printstudios.cl", "password": "admin123"})
        
        if login_response.status_code == 200:
            token = login_response.json()['token']
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get bot requests
            response = requests.get(f"{BASE_URL}/admin/bot-requests", headers=headers)
            if response.status_code == 200:
                requests_data = response.json()
                print(f"    ✅ Found {len(requests_data)} bot requests")
                
                # Get specific request details
                response = requests.get(f"{BASE_URL}/admin/bot-requests/{quote_request_id}", headers=headers)
                if response.status_code == 200:
                    request_details = response.json()
                    print(f"    ✅ Retrieved request details with {len(request_details.get('conversation', []))} messages")
                    
                    # Convert to quote
                    convert_data = {
                        "estimatedPrice": 25000,
                        "estimatedDays": 5,
                        "notes": "Carcasa Arduino en PETG negro"
                    }
                    response = requests.post(f"{BASE_URL}/admin/bot-requests/{quote_request_id}/convert", 
                                           json=convert_data, headers=headers)
                    if response.status_code == 200:
                        convert_result = response.json()
                        print(f"    ✅ Converted to quote: {convert_result.get('quoteId')}")
                        return True
                    else:
                        print(f"    ❌ Failed to convert: {response.status_code}")
                else:
                    print(f"    ❌ Failed to get request details: {response.status_code}")
            else:
                print(f"    ❌ Failed to get bot requests: {response.status_code}")
        else:
            print(f"    ❌ Failed to login: {login_response.status_code}")
    
    return quote_request_id is not None

if __name__ == "__main__":
    success = test_complete_working_flow()
    if success:
        print(f"\n🎉 Complete chatbot flow test PASSED!")
    else:
        print(f"\n❌ Complete chatbot flow test FAILED!")