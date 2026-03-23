#!/bin/bash

# kaiyanTool Long-Running Agent Setup Verification Script
# Usage: ./verify-setup.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  kaiyanTool Agent Setup Verification"
echo "========================================"

PASSED=0
FAILED=0

check_file() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $desc: $file exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $desc: $file NOT FOUND"
        ((FAILED++))
    fi
}

check_json() {
    local file=$1
    local desc=$2
    
    if [ -f "$file" ]; then
        if node -e "JSON.parse(require('fs').readFileSync('$file'))" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $desc: valid JSON"
            ((PASSED++))
        else
            echo -e "${RED}✗${NC} $desc: invalid JSON"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗${NC} $desc: $file NOT FOUND"
        ((FAILED++))
    fi
}

check_json_field() {
    local file=$1
    local field=$2
    local desc=$3
    
    if [ -f "$file" ]; then
        local value=$(node -e "const d=JSON.parse(require('fs').readFileSync('$file')); console.log(d.$field)" 2>/dev/null || echo "")
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $desc: $field = $value"
            ((PASSED++))
        else
            echo -e "${RED}✗${NC} $desc: $field not found"
            ((FAILED++))
        fi
    fi
}

echo ""
echo "Checking required files..."
echo ""

check_file "feature_list.json" "Feature list"
check_file "claude-progress.txt" "Progress log"
check_file "init.sh" "Init script"
check_file "agent-start.sh" "Agent start script"
check_file ".cursorrules" "Cursor rules"

echo ""
echo "Validating JSON files..."
echo ""

check_json "feature_list.json" "Feature list JSON"
check_json_field "feature_list.json" "features.length" "Features count"

echo ""
echo "Checking feature list content..."
echo ""

FEATURE_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('feature_list.json')); console.log(d.features.length)" 2>/dev/null || echo "0")
echo "Found $FEATURE_COUNT features in feature_list.json"

PASSING_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('feature_list.json')); console.log(d.features.filter(f=>f.passes).length)" 2>/dev/null || echo "0")
echo "$PASSING_COUNT features marked as passing"

echo ""
echo "Checking progress file content..."
echo ""

if grep -q "PROJECT OVERVIEW\|项目概述" claude-progress.txt 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Progress file has project overview"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Progress file missing project overview"
    ((FAILED++))
fi

if grep -q "Agent\|Agent" claude-progress.txt 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Progress file has agent guidelines"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Progress file missing agent guidelines"
    ((FAILED++))
fi

echo ""
echo "========================================"
echo "  Verification Results"
echo "========================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
