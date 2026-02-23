# Life System Kanban - Project Status & Documentation

## Overview
A modern, fully-featured Kanban board application built with Node.js, TypeScript, React, Vite, Hono, and PGlite.

## Project Structure
```
life-system-kanban/
├── src/
│   ├── components/          # React components
│   │   ├── AddCardButton.tsx
│   │   ├── AddLaneButton.tsx
│   │   ├── CardMenu.tsx
│   │   ├── ColorPicker.tsx/test
│   │   ├── KanbanCard.tsx
│   │   ├── KanbanLane.tsx
│   │   ├── LaneMenu.tsx
│   │   └── Toast.tsx
│   ├── hooks/               # Custom React hooks with tests
│   │   ├── useCards.ts/test
│   │   └── useLanes.ts/test
│   ├── server/              # Backend server
│   │   ├── index.ts         # Hono API routes
│   │   └── db.ts            # PGlite database setup
│   ├── test/                # Test configuration
│   │   └── setup.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── App.css              # App styles
│   └── main.tsx             # Entry point
├── data/                    # Database storage
│   └── kanban.db
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Features Implemented
✅ Create/Read/Update/Delete (CRUD) operations for lanes
✅ CRUD operations for cards
✅ Drag and drop cards between lanes
✅ Rename lanes and cards
✅ Set custom colors for lanes and cards
✅ Delete lanes and cards
✅ Toast notifications for user feedback
✅ Persistent database storage with PGlite
✅ RESTful API with Hono
✅ Type-safe TypeScript throughout
✅ Unit tests for hooks and components
✅ Responsive UI with Radix UI components

## Available Scripts
```bash
npm run dev          # Start dev server (frontend + API proxy)
npm run server       # Start backend server in watch mode
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run type-check   # Type check without emitting
```

## Database Schema
### lanes table
- id: SERIAL PRIMARY KEY
- name: TEXT NOT NULL
- color: TEXT NOT NULL (default: '#3b82f6')
- position: INTEGER NOT NULL
- created_at: TIMESTAMP (auto-set)

### cards table
- id: SERIAL PRIMARY KEY
- lane_id: INTEGER NOT NULL (references lanes.id)
- name: TEXT NOT NULL
- color: TEXT NOT NULL (default: '#ffffff')
- position: INTEGER NOT NULL
- created_at: TIMESTAMP (auto-set)

## API Endpoints

### Lanes
- `GET /api/lanes` - Get all lanes
- `POST /api/lanes` - Create new lane
- `PATCH /api/lanes/:id` - Update lane
- `DELETE /api/lanes/:id` - Delete lane

### Cards
- `GET /api/cards` - Get all cards (optionally filter by lane_id)
- `POST /api/cards` - Create new card
- `PATCH /api/cards/:id` - Update card
- `POST /api/cards/move` - Move card between lanes
- `DELETE /api/cards/:id` - Delete card

## Testing Status
All tests passing:
- ✅ useLanes hook (4 tests) - Fetch, Add, Update, Delete
- ✅ useCards hook (5 tests) - Fetch, Add, Update, Delete, Move
- ✅ ColorPicker component (3 tests) - Rendering, Selection, Click Handler

## Development Notes
- Server runs on port 3000
- Frontend proxies /api requests to http://localhost:3000
- PGlite database is file-based at data/kanban.db
- All TypeScript strict mode enabled
- Database operations are cascading (deleting lane deletes its cards)

## Next Session Checklist
Before continuing development:
1. Ensure all npm dependencies are installed: `npm install`
2. Run tests to verify setup: `npm test`
3. Start dev server: `npm run dev`
4. Start API server in separate terminal: `npm run server`
5. Test drag and drop functionality
6. Verify color customization works
7. Check database persistence across restarts

