#!/bin/bash

# Sanity CMS Quick Start Script
# This script helps you get started with Sanity CMS integration

set -e

echo "🎨 Sanity CMS Integration - Quick Start"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -d "sanity" ]; then
  echo -e "${RED}Error: sanity/ directory not found${NC}"
  echo "Please run this script from the project root directory"
  exit 1
fi

if [ ! -d "ih-frontend" ]; then
  echo -e "${RED}Error: ih-frontend/ directory not found${NC}"
  echo "Please run this script from the project root directory"
  exit 1
fi

echo -e "${BLUE}Step 1: Install Sanity dependencies${NC}"
echo "------------------------------------"
cd sanity
if [ ! -d "node_modules" ]; then
  echo "Installing Sanity packages..."
  npm install
else
  echo "✅ Dependencies already installed"
fi
cd ..

echo ""
echo -e "${BLUE}Step 2: Check Sanity configuration${NC}"
echo "------------------------------------"
cd sanity
if [ ! -f "sanity.config.ts" ]; then
  echo -e "${RED}Error: sanity.config.ts not found${NC}"
  exit 1
fi

# Extract project ID from config
PROJECT_ID=$(grep -o "projectId: '[^']*'" sanity.config.ts | cut -d"'" -f2 || echo "")
DATASET=$(grep -o "dataset: '[^']*'" sanity.config.ts | cut -d"'" -f2 || echo "production")

if [ -z "$PROJECT_ID" ]; then
  echo -e "${YELLOW}Warning: Project ID not found in sanity.config.ts${NC}"
  echo "You'll need to run 'npx sanity init' first"
  echo ""
  read -p "Do you want to initialize Sanity now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx sanity init
  else
    echo "Please run 'npx sanity init' manually in the sanity/ directory"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"
  echo -e "${GREEN}✅ Dataset: $DATASET${NC}"
fi
cd ..

echo ""
echo -e "${BLUE}Step 3: Check frontend environment variables${NC}"
echo "------------------------------------"
cd ih-frontend

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
  else
    touch .env.local
  fi
fi

# Check if Sanity variables are set
if grep -q "NEXT_PUBLIC_SANITY_PROJECT_ID" .env.local; then
  CURRENT_PROJECT_ID=$(grep "NEXT_PUBLIC_SANITY_PROJECT_ID" .env.local | cut -d'=' -f2)
  if [ "$CURRENT_PROJECT_ID" != "$PROJECT_ID" ] && [ ! -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Updating NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local${NC}"
    sed -i.bak "s/NEXT_PUBLIC_SANITY_PROJECT_ID=.*/NEXT_PUBLIC_SANITY_PROJECT_ID=$PROJECT_ID/" .env.local
  fi
else
  echo -e "${YELLOW}Adding Sanity variables to .env.local${NC}"
  echo "" >> .env.local
  echo "# Sanity CMS Configuration" >> .env.local
  echo "NEXT_PUBLIC_SANITY_PROJECT_ID=$PROJECT_ID" >> .env.local
  echo "NEXT_PUBLIC_SANITY_DATASET=$DATASET" >> .env.local
  echo "NEXT_PUBLIC_SANITY_API_VERSION=2023-01-01" >> .env.local
  echo "SANITY_API_READ_TOKEN=" >> .env.local
  echo "SANITY_REVALIDATE_SECRET=" >> .env.local
fi

echo -e "${GREEN}✅ Environment file: .env.local${NC}"
echo ""
echo -e "${YELLOW}⚠️  You still need to add:${NC}"
echo "   - SANITY_API_READ_TOKEN (get from Sanity dashboard)"
echo "   - SANITY_REVALIDATE_SECRET (generate random string)"
echo ""
echo "See SANITY_INTEGRATION_COMPLETE.md for detailed instructions"

cd ..

echo ""
echo -e "${BLUE}Step 4: Deploy Sanity Studio${NC}"
echo "------------------------------------"
cd sanity
echo ""
read -p "Do you want to deploy Sanity Studio now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying Sanity Studio..."
  npx sanity deploy
  echo ""
  echo -e "${GREEN}✅ Sanity Studio deployed!${NC}"
  echo "You can access it at: https://$PROJECT_ID.sanity.studio"
else
  echo "You can deploy later with: cd sanity && npx sanity deploy"
fi
cd ..

echo ""
echo -e "${BLUE}Step 5: Test the integration${NC}"
echo "------------------------------------"
echo "To test locally:"
echo "  1. cd ih-frontend"
echo "  2. npm run dev"
echo "  3. Visit http://localhost:3000/packages"
echo ""
echo "To add content:"
echo "  1. Open Sanity Studio (deployed URL or 'cd sanity && npx sanity dev')"
echo "  2. Add destinations, packages, and deals"
echo "  3. Publish content"
echo "  4. Content will appear on frontend"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Sanity integration setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📚 Documentation:"
echo "   - SANITY_INTEGRATION_COMPLETE.md - Full integration guide"
echo "   - SANITY_WEBHOOK_SETUP.md - Webhook configuration"
echo ""
echo "🔑 Don't forget to:"
echo "   1. Add SANITY_API_READ_TOKEN to .env.local"
echo "   2. Add SANITY_REVALIDATE_SECRET to .env.local"
echo "   3. Setup webhook in Sanity dashboard"
echo "   4. Add sample content in Sanity Studio"
echo ""
echo "Happy content managing! 🎉"
