#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 Deployment completed!"
    echo "📝 Don't forget to:"
    echo "   1. Set VITE_API_BASE_URL environment variable in Vercel dashboard"
    echo "   2. Deploy your backend to Railway/Render"
    echo "   3. Update vercel.json with your backend URL"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi 