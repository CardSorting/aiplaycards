# Ultra-Simplified Startup

This application has been flattened to remove all complexity. No queues, no workers, no Redis - just the core Next.js app.

## Quick Start

```bash
npm run dev
```

That's it. The application starts immediately with zero configuration required.

## What's Included

### ✅ Core Application
- Next.js application with all routes and components
- Database integration (when configured)
- Authentication system
- API endpoints
- All main features work out of the box

### ❌ Removed Complexity
- Queue systems (BullMQ, pg-boss)
- Redis dependencies
- Worker processes
- Background job processing
- Complex orchestration

## Environment Variables

### Optional (App works without any)
- `DATABASE_URL` - PostgreSQL connection (shows warnings if missing)
- `AUTH_SECRET` - For authentication (uses default if missing)
- `AUTH_GOOGLE_ID/SECRET` - For Google login (optional)

The app starts and runs even without any environment variables set.

## Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run db:push         # Database schema management
npm run db:studio       # Database GUI
```

## No Troubleshooting Needed

The application starts immediately. If database features don't work, it's because `DATABASE_URL` isn't set - but the app still runs and shows the UI.
