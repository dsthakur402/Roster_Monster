#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8001"

# Generate a unique email for testing
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_subscription_${TIMESTAMP}@example.com"

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/docs" > /dev/null; then
    echo -e "${RED}Error: Server is not running. Please start the server first.${NC}"
    exit 1
fi
echo -e "${GREEN}Server is running${NC}"

# Register a test user
echo "Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register/" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_EMAIL'",
        "password": "testpassword123",
        "name": "Test User",
        "role": "radiologist"
    }')

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to register user${NC}"
    exit 1
fi

echo "Registration response: $REGISTER_RESPONSE"
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo -e "${RED}Failed to get user ID from registration response${NC}"
    exit 1
fi
echo -e "${GREEN}User registered successfully with ID: $USER_ID${NC}"

# Login to get access token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "'$TEST_EMAIL'",
        "password": "testpassword123"
    }')

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to login${NC}"
    exit 1
fi

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo -e "${RED}Failed to get access token${NC}"
    exit 1
fi
echo -e "${GREEN}Login successful${NC}"

# Test create order endpoint
echo "Testing create order endpoint..."
CREATE_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/subscriptions/create-order" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "planId": "plan_M123456789",
        "period": "monthly",
        "amount": 1000,
        "currency": "INR"
    }')

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create order${NC}"
    exit 1
fi

echo "Create order response: $CREATE_ORDER_RESPONSE"
ORDER_ID=$(echo "$CREATE_ORDER_RESPONSE" | jq -r '.orderId')
if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
    echo -e "${RED}Failed to get order ID${NC}"
    exit 1
fi
echo -e "${GREEN}Order created successfully with ID: $ORDER_ID${NC}"

# Note: Payment verification is skipped because it requires a valid Razorpay signature
echo -e "${GREEN}Skipping payment verification (requires valid Razorpay signature)${NC}"

# Test get current subscription endpoint
echo "Testing get current subscription endpoint..."
GET_SUBSCRIPTION_RESPONSE=$(curl -s -X GET "$BASE_URL/api/subscriptions/current" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get current subscription${NC}"
    exit 1
fi

echo "Get subscription response: $GET_SUBSCRIPTION_RESPONSE"
ERROR_DETAIL=$(echo "$GET_SUBSCRIPTION_RESPONSE" | jq -r '.detail')
if [ "$ERROR_DETAIL" = "No active subscription found" ]; then
    echo -e "${GREEN}Successfully verified that no active subscription exists (expected since payment was skipped)${NC}"
else
    PLAN_ID=$(echo "$GET_SUBSCRIPTION_RESPONSE" | jq -r '.planId')
    if [ -z "$PLAN_ID" ] || [ "$PLAN_ID" = "null" ]; then
        echo -e "${RED}Failed to get plan ID from subscription${NC}"
        exit 1
    fi
    echo -e "${GREEN}Current subscription retrieved successfully${NC}"
fi

echo -e "${GREEN}All subscription endpoint tests completed successfully${NC}" 