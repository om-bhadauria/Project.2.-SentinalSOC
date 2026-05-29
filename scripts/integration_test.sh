#!/bin/bash
# Integration test: Brings up docker-compose stack, runs scenario, asserts alert exists.
set -e

echo "Starting docker-compose stack in detached mode..."
docker-compose up -d

echo "Waiting for backend to be healthy..."
for i in {1..30}; do
  if curl -s http://localhost:4000/healthz >/dev/null; then
    echo "Backend is up!"
    break
  fi
  sleep 2
  if [ $i -eq 30 ]; then
    echo "Timeout waiting for backend!"
    docker-compose logs backend
    exit 1
  fi
done

echo "Running end-to-end scripted demo sequence..."
curl -X POST http://localhost:4000/api/activity \
     -H "Content-Type: application/json" \
     -d '{"userId":"test_user_ci", "eventType":"phish_click"}'

sleep 1

curl -X POST http://localhost:4000/api/activity \
     -H "Content-Type: application/json" \
     -d '{"userId":"test_user_ci", "eventType":"new_device"}'

echo "Waiting for correlation engine to process..."
sleep 5

echo "Asserting the final alert exists in the DB (or via API)..."
# We can check the /api/alerts endpoints with the demo admin token
# First get a token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin", "password":"SentinelDemo123!"}' | grep -oP '"token":"\K[^"]+')

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token!"
  exit 1
fi

ALERTS=$(curl -s -X GET http://localhost:4000/api/alerts \
     -H "Authorization: Bearer $TOKEN")

if echo "$ALERTS" | grep -q "test_user_ci"; then
  echo "SUCCESS: Alert found for test_user_ci!"
else
  echo "FAILURE: Alert not found!"
  echo "Audit context: $ALERTS"
  exit 1
fi

echo "Integration test passed. Tearing down stack..."
docker-compose down
