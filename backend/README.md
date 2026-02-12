# PlayMoreTCG Backend API

Standalone Express.js backend API extracted from the Next.js application.

## Features

- RESTful API endpoints
- PostgreSQL database with Drizzle ORM
- CORS enabled for cross-origin requests
- Rate limiting and security headers (Helmet)
- Request compression and logging

## API Endpoints

### Cards
- `GET /api/cards` - List all cards with filtering
- `GET /api/cards/:id` - Get a single card
- `POST /api/cards` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card

### Collections
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get a collection
- `POST /api/collections` - Create a collection
- `PUT /api/collections/:id` - Update a collection
- `DELETE /api/collections/:id` - Delete a collection

### Marketplace
- `GET /api/marketplace` - List marketplace items
- `GET /api/marketplace/:id` - Get a listing
- `POST /api/marketplace` - Create a listing
- `PATCH /api/marketplace/:id` - Update listing status

### Credits
- `GET /api/credits` - Get credit balance
- `GET /api/credits/transactions` - Get transaction history
- `POST /api/credits/purchase` - Purchase credits

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### Other Endpoints
- `GET /health` - Health check
- `/api/booster/*` - Booster pack operations
- `/api/uploads/*` - Image uploads
- `/api/yugioh/*` - Yu-Gi-Oh cards
- `/api/mtg/*` - Magic: The Gathering cards

## Getting Started

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Project Structure
```
backend/
├── src/
│   ├── routes/         # API route handlers
│   ├── db/            # Database schema and queries
│   ├── middleware/    # Express middleware
│   ├── services/      # Business logic services
│   └── index.ts       # Express app entry
├── dist/              # Compiled output
└── package.json
```

## Notes

- Authentication is handled externally - this API expects a valid user ID in requests
- The original Next.js `app/api/` routes have been converted to Express routes
- Database schema and queries are preserved from the original project
