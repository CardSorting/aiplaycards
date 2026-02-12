#!/bin/bash

# Fly.io deployment script with optimizations
set -e

echo "🚀 Starting optimized Fly.io deployment..."

# Check if we're authenticated
if ! fly auth whoami >/dev/null 2>&1; then
    echo "❌ Not authenticated with Fly.io. Please run 'fly auth login' first."
    exit 1
fi

# Clean up any previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .next
rm -rf out

# Pre-build step to generate necessary data
echo "📦 Running pre-build steps..."
npm run create:data

# Deploy with build args
echo "🏗️  Deploying to Fly.io with optimized build..."
fly deploy \
  --build-arg NEXT_PUBLIC_PAYPAL_CLIENT_ID="AYUqilo7wsIqIIKvqbfhYGEJ6dY8MkT6zPee1BLIi69ShlmpdB93FRzhN2S2oD-fTqWq7NOvwnln5ms4" \
  --build-arg NEXT_PUBLIC_ADMIN_EMAIL="willcruzdesigner@gmail.com" \
  --build-arg NEXT_PUBLIC_ADMIN_USER_ID="f3b75fc6-2baf-4a6d-a974-ac487e1f1a98" \
  --build-arg NEXTAUTH_URL="https://pokecardmaker.net" \
  --remote-only

echo "✅ Deployment completed successfully!"
