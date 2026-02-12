#!/bin/bash

# Deploy to Vercel with Cron Setup
# This script sets up environment variables and deploys

echo "🚀 Deploying to Vercel with Cron Setup"
echo ""

# Check if CRON_SECRET is already set
echo "🔍 Checking for existing CRON_SECRET..."
if vercel env ls | grep -q CRON_SECRET; then
    echo "✅ CRON_SECRET already exists"
else
    echo "❌ CRON_SECRET not found"
    echo ""
    echo "🔑 Setting up CRON_SECRET environment variable..."
    
    # Generate a secure secret
    CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "Generated secret: $CRON_SECRET"
    echo ""
    
    echo "📝 Adding CRON_SECRET to Vercel..."
    echo "When prompted:"
    echo "1. Paste the secret: $CRON_SECRET"
    echo "2. Select: Production (y)"
    echo "3. Select: Preview (y)" 
    echo "4. Select: Development (y)"
    echo ""
    
    # Add the environment variable
    echo $CRON_SECRET | vercel env add CRON_SECRET production preview development
    
    if [ $? -eq 0 ]; then
        echo "✅ CRON_SECRET added successfully"
    else
        echo "❌ Failed to add CRON_SECRET"
        echo "Please add manually via Vercel Dashboard:"
        echo "CRON_SECRET = $CRON_SECRET"
        echo ""
        read -p "Press Enter when you've added the environment variable..."
    fi
fi

echo ""
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Next steps:"
    echo "1. Check Vercel Functions dashboard for cron execution"
    echo "2. Test endpoints:"
    echo "   - Auto-trigger: https://your-app.vercel.app/api/workers/auto-trigger"
    echo "   - Queue status: https://your-app.vercel.app/api/workers/trigger"
    echo "   - Manual trigger: curl -X POST https://your-app.vercel.app/api/workers/trigger"
    echo ""
    echo "🎉 Your serverless booster queue is now live!"
else
    echo "❌ Deployment failed"
    echo "Check the error messages above and try again"
fi