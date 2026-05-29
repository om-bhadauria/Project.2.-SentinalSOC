#!/bin/bash
echo "Starting SentinelSOC local environment..."
cd ..

# Build and start all containers in detached mode
docker-compose -f infra/docker-compose.yml up -d --build

echo ""
echo "Containers started. Wait a few seconds for services to become available..."
sleep 5

echo "Frontend UI available at: http://localhost:5173"
echo "Backend API available at: http://localhost:4000"
echo "AI Phishing Model available at: http://localhost:8000"
echo "AI Behavior Model available at: http://localhost:8001"

echo ""
echo "Sending a benign URL scan to test connection..."
curl -X POST http://localhost:4000/api/scan/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <dummy-token>" \
  -d '{"url":"https://google.com"}'

echo ""
echo "To view logs, run: docker-compose -f infra/docker-compose.yml logs -f"
