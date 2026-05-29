#!/bin/bash
set -e

# SentinelSOC One-Click Deployment Script
DOCKER_USER=${DOCKER_USER:-"sentinelsoc"}
TAG=${TAG:-"latest"}

echo "🚀 Starting SentinelSOC Image Build Pipeline..."

if [ -z "$DOCKER_PASS" ] && [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  WARNING: No container registry credentials found."
    echo "This script requires you to be logged into Docker CLI or provide secrets."
    echo "To push images to a registry, please run: docker login"
    echo "Continuing with local build only..."
    PUSH=false
else
    PUSH=true
fi

echo "📦 Building Backend Image..."
docker build -t ${DOCKER_USER}/sentinelsoc-backend:${TAG} ./backend

echo "📦 Building Frontend Image..."
docker build -t ${DOCKER_USER}/sentinelsoc-frontend:${TAG} ./frontend

echo "📦 Building AI Service Image..."
docker build -t ${DOCKER_USER}/sentinelsoc-ai:${TAG} ./ai/behavior

if [ "$PUSH" = true ]; then
    echo "☁️ Pushing images to registry..."
    docker push ${DOCKER_USER}/sentinelsoc-backend:${TAG}
    docker push ${DOCKER_USER}/sentinelsoc-frontend:${TAG}
    docker push ${DOCKER_USER}/sentinelsoc-ai:${TAG}
    echo "✅ Successfully pushed to ${DOCKER_USER} namespace!"
else
    echo "✅ Local images built successfully. Pass credentials to push."
fi

echo "Done."
