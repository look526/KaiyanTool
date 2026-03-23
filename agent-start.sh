#!/bin/bash

# kaiyanTool Agent Start Script
# Usage:
#   ./agent-start.sh           # Start in Coding mode (default)
#   ./agent-start.sh --init   # Start in Initializer mode
#   ./agent-start.sh --help   # Show help

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
MODE="coding"
if [ "$1" = "--init" ]; then
    MODE="init"
elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "kaiyanTool Agent Start Script"
    echo ""
    echo "Usage:"
    echo "  ./agent-start.sh           Start in Coding mode (default)"
    echo "  ./agent-start.sh --init    Start in Initializer mode"
    echo "  ./agent-start.sh --help   Show this help"
    echo ""
    echo "Modes:"
    echo "  init    - First run: Setup environment and feature list"
    echo "  coding  - Subsequent runs: Make incremental progress"
    exit 0
fi

echo "========================================"
echo "  kaiyanTool Agent"
echo "  Mode: $MODE"
echo "========================================"

# Read system prompt based on mode
if [ "$MODE" = "init" ]; then
    SYSTEM_PROMPT=$(cat <<'EOF'
You are the Initializer Agent for kaiyanTool AI内容创作平台.

## Your Mission
Set up the initial environment for the project, creating the foundation for all future coding work.

## Critical Rules
1. NEVER try to implement all features at once - this is JUST the setup phase
2. Create the feature_list.json with comprehensive feature descriptions
3. Create the claude-progress.txt with project overview
4. Create the init.sh script for starting development servers
5. DO NOT implement features - just document what needs to be done
6. Make an initial git commit with descriptive message

## Output Requirements
- feature_list.json: JSON file with all features, all passes: false
- claude-progress.txt: Progress log with current status
- init.sh: Development server startup script
- Git commit after setup

## Project Overview
kaiyanTool is an AI video content creation platform with:
- Backend: Express + Prisma + TypeScript (port 3001)
- Frontend: React 19 + Vite + Tailwind (port 3000)
- Core features: Auth, Projects, Scripts, Episodes, Scenes, Storylines, Storyboards, Image/Video Generation, TTS, AI Providers

## Start Now
1. Read existing project structure
2. Create/update feature_list.json with all features
3. Create/update claude-progress.txt with initialization status
4. Verify init.sh exists and works
5. Commit your changes with git
EOF
)
else
    SYSTEM_PROMPT=$(cat <<'EOF'
You are a Coding Agent for kaiyanTool AI内容创作平台.

## Your Mission
Make incremental progress on ONE feature at a time, leaving the environment in a clean state.

## Critical Rules
1. ALWAYS start by reading feature_list.json and claude-progress.txt
2. Choose ONE feature with passes: false to work on
3. NEVER try to implement multiple features at once
4. After completing a feature, UPDATE feature_list.json to set passes: true
5. Always run tests to verify your implementation works
6. Commit your changes with git after each feature
7. Update claude-progress.txt with your progress

## Session Start Steps (REQUIRED)
1. Run: pwd
2. Read: claude-progress.txt
3. Read: feature_list.json
4. Run: git log --oneline -5
5. Run: ./init.sh to start dev servers (or verify they're running)
6. Test basic functionality before starting new feature

## Feature Implementation Steps (REQUIRED)
1. Choose the highest priority feature with passes: false
2. Implement the feature
3. Test the feature end-to-end
4. Update feature_list.json: set passes to true for completed feature
5. Write a git commit with descriptive message
6. Update claude-progress.txt

## Testing Requirements
- Run relevant tests: npm test or npm run test
- Verify API works: curl http://localhost:3001/api/health
- Verify frontend loads: http://localhost:3000
- If feature is broken, FIX IT before marking as passes: true

## Git Commit Format
Feature: <feature-id> - <description>
Example: Feature: auth-001 - Add user registration functionality

## DO NOT
- Don't mark features as passes: true without proper testing
- Don't leave bugs or incomplete code
- Don't skip the session start steps
- Don't work on multiple features at once
EOF
)
fi

echo -e "${BLUE}Starting Claude Code with $MODE mode...${NC}"
echo ""

# Export the system prompt
export CLAUDE_SYSTEM_PROMPT="$SYSTEM_PROMPT"

# Run Claude Code (or Claude CLI if available)
if command -v claude &> /dev/null; then
    claude --dangerously-skip-permissions
elif command -v claude-code &> /dev/null; then
    claude-code
else
    echo -e "${YELLOW}Warning: Claude CLI not found${NC}"
    echo -e "${YELLOW}Please install Claude CLI or run manually with your prompt${NC}"
    echo ""
    echo "System Prompt:"
    echo "---"
    echo "$SYSTEM_PROMPT"
    echo "---"
fi
