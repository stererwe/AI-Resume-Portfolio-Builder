#!/bin/bash

# AI Resume & Portfolio Builder Server Startup Script
# Usage: ./start-server.sh [port]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
DEFAULT_PORT=5001
PORT=${1:-$DEFAULT_PORT}

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 Starting AI Resume & Portfolio Builder...${NC}"
echo -e "${YELLOW}Project Directory: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}Server Port: ${PORT}${NC}"
echo -e "${YELLOW}Server URL: http://localhost:${PORT}${NC}"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing required packages...${NC}"
    pip3 install -r requirements.txt
fi

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Port ${PORT} is already in use.${NC}"
    echo -e "${YELLOW}Try a different port: ./start-server.sh 5002${NC}"
    echo -e "${YELLOW}Or kill the process using port ${PORT}:${NC}"
    echo "    sudo lsof -ti:${PORT} | xargs sudo kill -9"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Set environment variables
export PORT=$PORT
export FLASK_ENV=development

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  OpenAI API key not set. The app will use fallback content generation.${NC}"
    echo -e "${YELLOW}   To enable AI features, set your API key:${NC}"
    echo -e "${YELLOW}   export OPENAI_API_KEY=\"your_api_key_here\"${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Starting server...${NC}"
echo -e "${GREEN}   Open your browser and go to: http://localhost:${PORT}${NC}"
echo -e "${GREEN}   Press Ctrl+C to stop the server${NC}"
echo ""

# Start the Flask server
python3 app.py