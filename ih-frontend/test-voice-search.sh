#!/bin/bash

# Voice Search Quick Test Script
# This script helps you test the voice search feature quickly

echo "🎙️  Idea Holiday Voice Search - Quick Test"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo "Creating .env.local with default values..."
    cat > .env.local << 'EOF'
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=32zq1f7y
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-10-15
SANITY_REVALIDATE_SECRET=my-secret-revalidate-token-2025
NEXT_PUBLIC_SITE_URL=http://localhost:3010

# OpenAI API for Voice Search (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your-openai-api-key-here
EOF
    echo "✅ Created .env.local"
fi

# Check API key
OPENAI_KEY=$(grep OPENAI_API_KEY .env.local | cut -d '=' -f2)

if [ "$OPENAI_KEY" = "your-openai-api-key-here" ] || [ -z "$OPENAI_KEY" ]; then
    echo "⚠️  OpenAI API key not configured"
    echo ""
    echo "Voice search will work in MOCK MODE (sample data)"
    echo ""
    echo "To enable real AI voice search:"
    echo "1. Get API key: https://platform.openai.com/api-keys"
    echo "2. Edit .env.local and set: OPENAI_API_KEY=sk-your-key"
    echo ""
else
    echo "✅ OpenAI API key configured"
    echo ""
fi

echo "📋 Voice Search Features:"
echo "  • Global search: Floating button (bottom-right)"
echo "  • Flight form: Microphone icon in search form"
echo "  • Multi-language: English, Hindi, Hinglish"
echo "  • Smart routing: Auto-routes to correct pages"
echo ""

echo "🎯 Try these queries:"
echo "  • 'Find flights from Delhi to Dubai next week'"
echo "  • 'Show me hotels in Paris for next weekend'"
echo "  • 'Dubai holiday packages for 5 days'"
echo "  • 'What are your cancellation policies?'"
echo ""

echo "🚀 Starting development server..."
echo ""

# Start the dev server
npm run dev
