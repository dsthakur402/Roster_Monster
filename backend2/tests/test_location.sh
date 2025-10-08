#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8000"

# Generate a random email for admin user
EMAIL="test_$(date +%s)@example.com"

echo "Testing Location Endpoints..."

# 1. Create an admin user for authentication
echo -e "\n${GREEN}1. Creating an admin user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Admin\",
    \"email\": \"$EMAIL\",
    \"password\": \"test123\",
    \"userType\": \"Admin\"
  }")

echo "Response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"id"* ]]; then
  USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.id')
  echo "✅ Admin user created successfully"
  echo "User ID: $USER_ID"
else
  echo -e "${RED}❌ Failed to create admin user${NC}"
  echo "Error: $REGISTER_RESPONSE"
  exit 1
fi

# 2. Login to get access token
echo -e "\n${GREEN}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$EMAIL\",
    \"password\": \"test123\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [[ $ACCESS_TOKEN != "null" && $ACCESS_TOKEN != "" ]]; then
  echo "✅ Login successful"
  echo "Access token: ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "Error: $LOGIN_RESPONSE"
  exit 1
fi

# 3. Create a location
echo -e "\n${GREEN}3. Testing POST /api/locations/...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/locations/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"location\": \"Test Location\"
  }")

echo "Response: $CREATE_RESPONSE"

if [[ $CREATE_RESPONSE == *"id"* ]]; then
  LOCATION_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
  echo "✅ Location created successfully"
  echo "Location ID: $LOCATION_ID"
else
  echo -e "${RED}❌ Failed to create location${NC}"
  echo "Error: $CREATE_RESPONSE"
  exit 1
fi

# 4. Get all locations
echo -e "\n${GREEN}4. Testing GET /api/locations/...${NC}"
LOCATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/locations/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $LOCATIONS_RESPONSE"

if [[ $LOCATIONS_RESPONSE == *"["* ]]; then
  echo "✅ Get locations successful"
else
  echo -e "${RED}❌ Get locations failed${NC}"
  echo "Error: $LOCATIONS_RESPONSE"
  exit 1
fi

# 5. Get specific location
echo -e "\n${GREEN}5. Testing GET /api/locations/$LOCATION_ID...${NC}"
LOCATION_RESPONSE=$(curl -s -X GET "$BASE_URL/api/locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $LOCATION_RESPONSE"

if [[ $LOCATION_RESPONSE == *"id"* ]]; then
  echo "✅ Get location successful"
else
  echo -e "${RED}❌ Get location failed${NC}"
  echo "Error: $LOCATION_RESPONSE"
  exit 1
fi

# 6. Update location
echo -e "\n${GREEN}6. Testing PUT /api/locations/$LOCATION_ID...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"location\": \"Updated Test Location\"
  }")

echo "Response: $UPDATE_RESPONSE"

if [[ $UPDATE_RESPONSE == *"id"* ]]; then
  echo "✅ Update location successful"
else
  echo -e "${RED}❌ Update location failed${NC}"
  echo "Error: $UPDATE_RESPONSE"
  exit 1
fi

# 7. Delete location
echo -e "\n${GREEN}7. Testing DELETE /api/locations/$LOCATION_ID...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/locations/$LOCATION_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $DELETE_RESPONSE"

if [[ $DELETE_RESPONSE == *"message"* ]]; then
  echo "✅ Delete location successful"
else
  echo -e "${RED}❌ Delete location failed${NC}"
  echo "Error: $DELETE_RESPONSE"
  exit 1
fi

# 8. Clean up - Delete admin user
echo -e "\n${GREEN}8. Cleaning up - Deleting admin user...${NC}"
USER_DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/user/$USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [[ $USER_DELETE_RESPONSE == "" || $USER_DELETE_RESPONSE == "{}" ]]; then
  echo "✅ Admin user deleted successfully"
else
  echo -e "${RED}❌ Failed to delete admin user${NC}"
  echo "Error: $USER_DELETE_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}All location endpoint tests completed successfully!${NC}" 