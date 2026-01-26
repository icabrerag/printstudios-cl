#!/usr/bin/env python3
"""
PrintStudios.cl Backend API Testing Suite
Tests all backend endpoints for the MVP
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://printstudios-app.preview.emergentagent.com/api"

class PrintStudiosAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_results = []
        self.created_quote_id = None
        self.created_service_id = None
        self.created_portfolio_id = None
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        })
        
    def test_public_services_api(self):
        """Test GET /api/services - Public services endpoint"""
        try:
            response = requests.get(f"{self.base_url}/services", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if services have required fields
                    service = data[0]
                    required_fields = ['id', 'title', 'description', 'basePrice', 'category']
                    missing_fields = [field for field in required_fields if field not in service]
                    
                    if not missing_fields:
                        self.log_test("GET /api/services", True, 
                                    f"Returned {len(data)} services with correct structure")
                        return True
                    else:
                        self.log_test("GET /api/services", False, 
                                    f"Services missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("GET /api/services", False, "No services returned or invalid format")
                    return False
            else:
                self.log_test("GET /api/services", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/services", False, f"Request failed: {str(e)}")
            return False
    
    def test_public_portfolio_api(self):
        """Test GET /api/portfolio - Public portfolio endpoint"""
        try:
            response = requests.get(f"{self.base_url}/portfolio", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if portfolio items have required fields
                    item = data[0]
                    required_fields = ['id', 'title', 'category', 'image', 'description']
                    missing_fields = [field for field in required_fields if field not in item]
                    
                    if not missing_fields:
                        self.log_test("GET /api/portfolio", True, 
                                    f"Returned {len(data)} portfolio items with correct structure")
                        return True
                    else:
                        self.log_test("GET /api/portfolio", False, 
                                    f"Portfolio items missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("GET /api/portfolio", False, "No portfolio items returned or invalid format")
                    return False
            else:
                self.log_test("GET /api/portfolio", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/portfolio", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_quote_api(self):
        """Test POST /api/quotes - Create quote (public)"""
        try:
            # First get a service ID for the quote
            services_response = requests.get(f"{self.base_url}/services", timeout=10)
            if services_response.status_code != 200:
                self.log_test("POST /api/quotes", False, "Could not get services for quote test")
                return False
                
            services = services_response.json()
            if not services:
                self.log_test("POST /api/quotes", False, "No services available for quote test")
                return False
                
            service_id = services[0]['id']
            
            # Create quote with realistic Chilean data
            quote_data = {
                "name": "María González",
                "email": "maria.gonzalez@empresa.cl",
                "serviceId": service_id,
                "phone": "+56912345678",
                "material": "PLA",
                "size": "10x10x5 cm",
                "quantity": 5,
                "notes": "Necesito el prototipo para presentación el próximo viernes"
            }
            
            response = requests.post(f"{self.base_url}/quotes", 
                                   json=quote_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('quoteId'):
                    self.created_quote_id = data['quoteId']
                    self.log_test("POST /api/quotes", True, 
                                f"Quote created successfully with ID: {self.created_quote_id}")
                    return True
                else:
                    self.log_test("POST /api/quotes", False, 
                                f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("POST /api/quotes", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/quotes", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test POST /api/auth/login - Admin authentication"""
        try:
            login_data = {
                "email": "admin@printstudios.cl",
                "password": "admin123"
            }
            
            response = requests.post(f"{self.base_url}/auth/login", 
                                   json=login_data, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('token') and data.get('user'):
                    self.auth_token = data['token']
                    user = data['user']
                    if user.get('email') == 'admin@printstudios.cl' and user.get('role') == 'admin':
                        self.log_test("POST /api/auth/login", True, 
                                    f"Admin login successful, token received")
                        return True
                    else:
                        self.log_test("POST /api/auth/login", False, 
                                    f"Invalid user data: {user}")
                        return False
                else:
                    self.log_test("POST /api/auth/login", False, 
                                f"Missing token or user in response: {data}")
                    return False
            else:
                self.log_test("POST /api/auth/login", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST /api/auth/login", False, f"Request failed: {str(e)}")
            return False
    
    def test_protected_route_without_token(self):
        """Test that protected routes return 401 without token"""
        try:
            response = requests.get(f"{self.base_url}/admin/dashboard", timeout=10)
            
            if response.status_code == 401:
                self.log_test("Protected Route Security", True, 
                            "Admin dashboard correctly returns 401 without token")
                return True
            else:
                self.log_test("Protected Route Security", False, 
                            f"Expected 401, got {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Protected Route Security", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_dashboard(self):
        """Test GET /api/admin/dashboard - Admin dashboard with auth"""
        if not self.auth_token:
            self.log_test("GET /api/admin/dashboard", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.base_url}/admin/dashboard", 
                                  headers=headers, 
                                  timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'stats' in data and 'recentQuotes' in data:
                    stats = data['stats']
                    required_stats = ['totalQuotes', 'pendingQuotes', 'approvedQuotes', 
                                    'completedOrders', 'totalRevenue']
                    missing_stats = [stat for stat in required_stats if stat not in stats]
                    
                    if not missing_stats:
                        self.log_test("GET /api/admin/dashboard", True, 
                                    f"Dashboard data complete with {stats['totalQuotes']} total quotes")
                        return True
                    else:
                        self.log_test("GET /api/admin/dashboard", False, 
                                    f"Missing stats: {missing_stats}")
                        return False
                else:
                    self.log_test("GET /api/admin/dashboard", False, 
                                f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("GET /api/admin/dashboard", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/dashboard", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_quotes_list(self):
        """Test GET /api/admin/quotes - Get all quotes"""
        if not self.auth_token:
            self.log_test("GET /api/admin/quotes", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = requests.get(f"{self.base_url}/admin/quotes", 
                                  headers=headers, 
                                  timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("GET /api/admin/quotes", True, 
                                f"Retrieved {len(data)} quotes")
                    return True
                else:
                    self.log_test("GET /api/admin/quotes", False, 
                                f"Expected array, got: {type(data)}")
                    return False
            else:
                self.log_test("GET /api/admin/quotes", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET /api/admin/quotes", False, f"Request failed: {str(e)}")
            return False
    
    def test_update_quote_status(self):
        """Test PUT /api/admin/quotes/:id - Update quote status"""
        if not self.auth_token:
            self.log_test("PUT /api/admin/quotes/:id", False, "No auth token available")
            return False
            
        if not self.created_quote_id:
            self.log_test("PUT /api/admin/quotes/:id", False, "No quote ID available for update")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            update_data = {
                "status": "approved",
                "estimatedPrice": 45000,
                "notes": "Cotización aprobada, proceder con producción"
            }
            
            response = requests.put(f"{self.base_url}/admin/quotes/{self.created_quote_id}", 
                                  json=update_data,
                                  headers=headers, 
                                  timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("PUT /api/admin/quotes/:id", True, 
                                "Quote status updated successfully")
                    return True
                else:
                    self.log_test("PUT /api/admin/quotes/:id", False, 
                                f"Update failed: {data}")
                    return False
            else:
                self.log_test("PUT /api/admin/quotes/:id", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("PUT /api/admin/quotes/:id", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_services_crud(self):
        """Test admin services CRUD operations"""
        if not self.auth_token:
            self.log_test("Admin Services CRUD", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET /api/admin/services
            response = requests.get(f"{self.base_url}/admin/services", 
                                  headers=headers, timeout=10)
            
            if response.status_code != 200:
                self.log_test("Admin Services CRUD", False, 
                            f"GET services failed: {response.status_code}")
                return False
            
            # Test POST /api/admin/services
            new_service = {
                "title": "Servicio de Prueba",
                "description": "Servicio creado durante testing",
                "basePrice": 30000,
                "category": "test",
                "image": "https://example.com/test.jpg",
                "features": ["Feature 1", "Feature 2"]
            }
            
            response = requests.post(f"{self.base_url}/admin/services", 
                                   json=new_service,
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('service'):
                    self.created_service_id = data['service']['id']
                    
                    # Test PUT /api/admin/services/:id
                    update_data = {"title": "Servicio de Prueba Actualizado"}
                    response = requests.put(f"{self.base_url}/admin/services/{self.created_service_id}", 
                                          json=update_data,
                                          headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        # Test DELETE /api/admin/services/:id
                        response = requests.delete(f"{self.base_url}/admin/services/{self.created_service_id}", 
                                                 headers=headers, timeout=10)
                        
                        if response.status_code == 200:
                            self.log_test("Admin Services CRUD", True, 
                                        "All CRUD operations successful")
                            return True
                        else:
                            self.log_test("Admin Services CRUD", False, 
                                        f"DELETE failed: {response.status_code}")
                            return False
                    else:
                        self.log_test("Admin Services CRUD", False, 
                                    f"PUT failed: {response.status_code}")
                        return False
                else:
                    self.log_test("Admin Services CRUD", False, 
                                f"POST response invalid: {data}")
                    return False
            else:
                self.log_test("Admin Services CRUD", False, 
                            f"POST failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Services CRUD", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_portfolio_crud(self):
        """Test admin portfolio CRUD operations"""
        if not self.auth_token:
            self.log_test("Admin Portfolio CRUD", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET /api/admin/portfolio
            response = requests.get(f"{self.base_url}/admin/portfolio", 
                                  headers=headers, timeout=10)
            
            if response.status_code != 200:
                self.log_test("Admin Portfolio CRUD", False, 
                            f"GET portfolio failed: {response.status_code}")
                return False
            
            # Test POST /api/admin/portfolio
            new_item = {
                "title": "Proyecto de Prueba",
                "category": "Test",
                "image": "https://example.com/test.jpg",
                "description": "Proyecto creado durante testing"
            }
            
            response = requests.post(f"{self.base_url}/admin/portfolio", 
                                   json=new_item,
                                   headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('item'):
                    self.created_portfolio_id = data['item']['id']
                    
                    # Test DELETE /api/admin/portfolio/:id
                    response = requests.delete(f"{self.base_url}/admin/portfolio/{self.created_portfolio_id}", 
                                             headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        self.log_test("Admin Portfolio CRUD", True, 
                                    "Portfolio CRUD operations successful")
                        return True
                    else:
                        self.log_test("Admin Portfolio CRUD", False, 
                                    f"DELETE failed: {response.status_code}")
                        return False
                else:
                    self.log_test("Admin Portfolio CRUD", False, 
                                f"POST response invalid: {data}")
                    return False
            else:
                self.log_test("Admin Portfolio CRUD", False, 
                            f"POST failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Portfolio CRUD", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting PrintStudios.cl Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Public API Tests
        print("\n📋 Testing Public APIs...")
        self.test_public_services_api()
        self.test_public_portfolio_api()
        self.test_create_quote_api()
        
        # Auth Tests
        print("\n🔐 Testing Authentication...")
        self.test_protected_route_without_token()
        self.test_admin_login()
        
        # Admin API Tests
        print("\n👨‍💼 Testing Admin APIs...")
        self.test_admin_dashboard()
        self.test_admin_quotes_list()
        self.test_update_quote_status()
        self.test_admin_services_crud()
        self.test_admin_portfolio_crud()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = PrintStudiosAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)