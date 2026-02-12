# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=23.5.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1


# Dependencies stage - cache node_modules separately
FROM base AS deps

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev --prefer-offline --no-audit


# Build stage
FROM base AS build

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy only source files needed for build (exclude large assets)
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY next.config.js next.config.js
COPY tailwind.config.ts tailwind.config.ts
COPY components.json components.json
COPY next-sitemap.config.js next-sitemap.config.js
COPY auth.ts auth.ts
COPY middleware.ts middleware.ts
COPY instrumentation.ts instrumentation.ts
COPY drizzle/ drizzle/
COPY src/ src/
COPY app/ app/

# Copy only essential public files (not the large assets yet)
# Large assets are excluded from .dockerignore but copied separately in assets stage
COPY public/favicon public/favicon
COPY public/fonts public/fonts
COPY public/*.txt public/
COPY public/*.json public/
COPY public/*.xml public/
COPY public/*.ico public/

# Copy scripts needed for build
COPY scripts/createCardImgPathArray.js scripts/createCardImgPathArray.js
COPY scripts/generate-sitemaps.js scripts/generate-sitemaps.js
COPY scripts/generate-rss.js scripts/generate-rss.js
COPY docker-entrypoint.js docker-entrypoint.js

# Accept build args for Next.js public env vars
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_ADMIN_EMAIL
ARG NEXT_PUBLIC_ADMIN_USER_ID
ARG NEXTAUTH_URL

# Set env vars for build
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_ADMIN_EMAIL=$NEXT_PUBLIC_ADMIN_EMAIL
ENV NEXT_PUBLIC_ADMIN_USER_ID=$NEXT_PUBLIC_ADMIN_USER_ID
ENV NEXTAUTH_URL=$NEXTAUTH_URL

# Skip postbuild scripts during Docker build (they'll run at startup if needed)
ENV SKIP_POSTBUILD=true

# Build application - using parallel builds and optimizations
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Assets stage - separate stage for large static assets
FROM base AS assets

# Copy only the large asset directories from the build context
# Note: These are excluded from .dockerignore but copied here to keep them out of build stage
COPY --chown=node:node public/assets public/assets


# Final stage for app image
FROM base

# Install tsx globally for worker processes
RUN npm install -g tsx && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/docker-entrypoint.js ./docker-entrypoint.js
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/auth.ts ./auth.ts
COPY --from=build /app/middleware.ts ./middleware.ts

# Copy small public files from build stage
COPY --from=build /app/public ./public

# Copy large assets from assets stage (bypasses build stage)
COPY --from=assets /app/public/assets ./public/assets

# Entrypoint sets up the container.
ENTRYPOINT [ "/app/docker-entrypoint.js" ]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "start" ]
