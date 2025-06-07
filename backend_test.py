import requests
import unittest
import os
import pandas as pd
import io
import uuid
import time

class RealEstateAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.property_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_properties(self):
        """Test getting all properties"""
        success, response = self.run_test(
            "Get Properties",
            "GET",
            "api/properties",
            200
        )
        if success and 'properties' in response:
            properties = response['properties']
            print(f"Found {len(properties)} properties")
            # Store property IDs for later tests
            self.property_ids = [prop['id'] for prop in properties]
            return True
        return False

    def test_upload_excel(self, file_path):
        """Test uploading an Excel file"""
        if not os.path.exists(file_path):
            # Create a sample Excel file
            print("Creating sample Excel file...")
            df = pd.DataFrame({
                'name': ['Luxury Villa', 'Modern Apartment', 'Beachfront Condo', 'Suburban House', 'Downtown Loft'],
                'number': ['+1234567890', '+0987654321', '+1122334455', '+5566778899', '+9988776655'],
                'location': ['Malibu, CA', 'New York, NY', 'Miami, FL', 'Austin, TX', 'Chicago, IL'],
                'pricing': ['₹5,000,000', '₹2,500,000', '₹3,750,000', '₹1,800,000', '₹2,200,000'],
                'requirements': ['4 BHK, Pool', '2 BHK, Modern', '3 BHK, Ocean View', '3 BHK, Garden', '1 BHK, City View'],
                'remarks': ['Premium property', 'Recently renovated', 'Beachfront access', 'Family-friendly', 'Urban living']
            })
            df.to_excel(file_path, index=False)
            print(f"Sample Excel file created at {file_path}")

        with open(file_path, 'rb') as f:
            files = {'file': ('properties.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            success, response = self.run_test(
                "Upload Excel",
                "POST",
                "api/upload-excel",
                200,
                files=files
            )
            return success
    
    def test_initiate_contact(self, property_id, contact_type):
        """Test initiating contact"""
        success, response = self.run_test(
            f"Initiate {contact_type.capitalize()} Contact",
            "POST",
            f"api/initiate-contact?property_id={property_id}&contact_type={contact_type}",
            200
        )
        if success and 'call_id' in response:
            return response['call_id']
        return None

    def test_update_call(self, call_id):
        """Test updating call with remarks and requirement status"""
        data = {
            "call_id": call_id,
            "remarks": "Customer is interested in viewing the property next week",
            "requirement_status": "future_requirement"
        }
        success, _ = self.run_test(
            "Update Call",
            "POST",
            "api/update-call",
            200,
            data=data
        )
        return success

    def test_get_calls(self):
        """Test getting all call records"""
        success, response = self.run_test(
            "Get All Calls",
            "GET",
            "api/calls",
            200
        )
        if success and 'calls' in response:
            print(f"Found {len(response['calls'])} call records")
            return True
        return False

    def test_get_property_calls(self, property_id):
        """Test getting calls for a specific property"""
        success, response = self.run_test(
            "Get Property Calls",
            "GET",
            f"api/calls/{property_id}",
            200
        )
        if success and 'calls' in response:
            print(f"Found {len(response['calls'])} call records for property {property_id}")
            return True
        return False

    def test_clear_properties(self):
        """Test clearing all properties"""
        success, response = self.run_test(
            "Clear Properties",
            "DELETE",
            "api/properties",
            200
        )
        return success

def main():
    # Get backend URL from frontend .env
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.strip().split('=')[1].strip('"\'')
                    break
    except:
        backend_url = "https://d7a39ae1-f72f-40de-8faf-30a033515f35.preview.emergentagent.com"
    
    print(f"Using backend URL: {backend_url}")
    
    # Setup
    tester = RealEstateAPITester(backend_url)
    excel_file = "/app/sample_properties.xlsx"
    
    # Run tests
    print("\n==== Testing Real Estate Communication Platform API ====\n")
    
    # Test 1: Get properties (may be empty initially)
    tester.test_get_properties()
    
    # Test 2: Upload Excel file with property data
    if tester.test_upload_excel(excel_file):
        print("Excel upload successful")
    
    # Test 3: Get properties again (should have data now)
    if tester.test_get_properties():
        if tester.property_ids:
            property_id = tester.property_ids[0]
            
            # Test 4: Initiate WhatsApp contact
            tester.test_initiate_contact(property_id, 'whatsapp')
            
            # Test 5: Initiate call contact
            call_id = tester.test_initiate_contact(property_id, 'call')
            
            if call_id:
                # Test 6: Update call
                tester.test_update_call(call_id)
                
                # Test 7: Get all calls
                tester.test_get_calls()
                
                # Test 8: Get property calls
                tester.test_get_property_calls(property_id)
    
    # Test 9: Clear properties (optional, comment out if you want to keep the data)
    # tester.test_clear_properties()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    main()
