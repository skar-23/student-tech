#!/bin/bash

echo "🚀 Student Tech Deployment Helper Script"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root of your student-tech repository"
    exit 1
fi

echo "📍 Current branch: $(git branch --show-current)"
echo ""

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Please commit or stash them before continuing"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🔄 Step 1: Switching to main branch..."
git checkout main

echo "🔄 Step 2: Pulling latest changes..."
git pull origin main

echo "🔄 Step 3: Merging feature branch..."
git merge copilot/fix-08d19295-8934-42da-b328-85a8d87acb66

if [ $? -eq 0 ]; then
    echo "✅ Merge successful!"
    echo ""
    echo "🔄 Step 4: Pushing to trigger deployment..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Deployment triggered!"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://github.com/skar-23/student-tech/actions"
        echo "2. Monitor the 'Deploy to GitHub Pages' workflow"
        echo "3. Once complete, visit: https://skar-23.github.io/student-tech/"
        echo ""
        echo "📋 Don't forget to:"
        echo "- Add GitHub secrets (see DEPLOYMENT_GUIDE.md)"
        echo "- Enable GitHub Pages in repository settings"
        echo "- Rotate your Resend API key for security"
    else
        echo "❌ Error pushing to main branch"
        echo "Please check your permissions and try again"
    fi
else
    echo "❌ Merge failed - please resolve conflicts manually"
    echo "Run 'git status' to see what needs to be resolved"
fi