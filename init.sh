#!/bin/bash

# kaiyanTool Development Server Init Script
# Usage: ./init.sh

set -e

echo "========================================"
echo "  kaiyanTool Development Server"
echo "========================================"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting services...${NC}"

# Check if .env file exists
if [ ! -f "apps/api/.env" ]; then
    echo -e "${RED}Warning: apps/api/.env not found${NC}"
    echo -e "${YELLOW}Copy from .env.example and configure${NC}"
fi

# Start API server (background)
echo -e "${GREEN}Starting API server on port 3001...${NC}"
cd apps/api
npm run dev &
API_PID=$!

cd "$SCRIPT_DIR"

# Wait for API to be ready
echo -e "${YELLOW}Waiting for API server...${NC}"
sleep 5

# Start Web server (background)
echo -e "${GREEN}Starting Web server on port 3000...${NC}"
cd apps/web
npm run dev &
WEB_PID=$!

cd "$SCRIPT_DIR"

echo ""
echo "========================================"
echo -e "${GREEN}Services started successfully!${NC}"
echo "========================================"
echo "API Server:  http://localhost:3001"
echo "Web Server:  http://localhost:3000"
echo ""
echo "To stop services:"
echo "  kill $API_PID $WEB_PID"
echo "========================================"

# Keep script running
wait
