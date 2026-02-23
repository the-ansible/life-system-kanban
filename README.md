# Life System Kanban

A modern, fully-featured Kanban board application built with React, TypeScript, Vite, Hono, and PGlite. Organize your tasks with swim lanes and drag-and-drop cards, with full customization options.

## Features

✨ **Core Functionality**
- Create, read, update, and delete swim lanes
- Create, read, update, and delete cards within lanes
- Rename lanes and cards
- Customize colors for lanes and cards
- Drag and drop cards between lanes
- Visual feedback with toast notifications
- Persistent data storage

🎨 **User Experience**
- Intuitive drag-and-drop interface powered by @dnd-kit
- Radix UI components for accessible, polished interface
- Color picker with 20 preset colors
- Double-click to rename lanes and cards
- Menu-driven card and lane operations
- Real-time updates with optimistic rendering

🔒 **Technical Excellence**
- Full TypeScript with strict mode enabled
- Type-safe API interfaces
- Unit tests with Vitest (12 tests, all passing)
- File-based database with PGlite
- RESTful API with Hono
- Production-ready build process

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, @dnd-kit (drag & drop)
- **UI Components:** Radix UI (Dialog, Dropdown, Toast, Icons)
- **Backend:** Hono (lightweight web framework)
- **Database:** PGlite (in-process PostgreSQL)
- **Build:** Vite with TypeScript support
- **Testing:** Vitest with React Testing Library

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Clone and navigate to the project
cd life-system-kanban

# Install dependencies
npm install
```

## Development

### Start the Development Server

```bash
# Terminal 1: Start the frontend with Vite (includes API proxy)
npm run dev

# Terminal 2 (optional): Start the backend server directly
npm run server
```

The frontend will be available at `http://localhost:5173` and automatically proxies `/api` requests to the backend on port 3000.

### Running Tests

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run tests with UI dashboard
npm run test:ui
```

### Type Checking

```bash
# Type check without emitting files
npm run type-check
```

## Production Build

```bash
npm run build
```

This creates a `dist` folder with optimized production files ready to deploy.

## Project Structure

```
life-system-kanban/
├── src/
│   ├── components/              # React UI components
│   │   ├── KanbanLane.tsx       # Lane component with drop zone
│   │   ├── KanbanCard.tsx       # Draggable card component
│   │   ├── AddLaneButton.tsx    # New lane dialog
│   │   ├── AddCardButton.tsx    # New card dialog
│   │   ├── LaneMenu.tsx         # Lane context menu
│   │   ├── CardMenu.tsx         # Card context menu
│   │   ├── ColorPicker.tsx      # Color selection component
│   │   └── Toast.tsx            # Toast notification component
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLanes.ts          # Lanes CRUD operations
│   │   ├── useCards.ts          # Cards CRUD operations
│   │   └── *.test.ts            # Unit tests
│   ├── server/                  # Backend
│   │   ├── index.ts             # Hono API routes
│   │   └── db.ts                # PGlite initialization
│   ├── types/                   # TypeScript interfaces
│   │   └── index.ts
│   ├── test/                    # Test configuration
│   │   └── setup.ts
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   └── main.tsx                 # React entry point
├── data/                        # Database storage
│   └── kanban.db                # PGlite database file
├── dist/                        # Built output (after npm run build)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## API Endpoints

### Lanes

- `GET /api/lanes` - Get all lanes
- `POST /api/lanes` - Create a new lane
  - Body: `{ name: string, color?: string, position: number }`
- `PATCH /api/lanes/:id` - Update a lane
  - Body: `{ name?: string, color?: string, position?: number }`
- `DELETE /api/lanes/:id` - Delete a lane

### Cards

- `GET /api/cards` - Get all cards (or optionally filter by lane_id query param)
- `POST /api/cards` - Create a new card
  - Body: `{ lane_id: number, name: string, color?: string, position: number }`
- `PATCH /api/cards/:id` - Update a card
  - Body: `{ name?: string, color?: string, lane_id?: number, position?: number }`
- `POST /api/cards/move` - Move a card to a different lane
  - Body: `{ cardId: number, targetLaneId: number, newPosition: number }`
- `DELETE /api/cards/:id` - Delete a card

## Database Schema

### lanes table
```sql
id              SERIAL PRIMARY KEY
name            TEXT NOT NULL
color           TEXT NOT NULL DEFAULT '#3b82f6'
position        INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### cards table
```sql
id              SERIAL PRIMARY KEY
lane_id         INTEGER NOT NULL (REFERENCES lanes.id ON DELETE CASCADE)
name            TEXT NOT NULL
color           TEXT NOT NULL DEFAULT '#ffffff'
position        INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Note: Deleting a lane automatically deletes all its cards (CASCADE).

## Usage Guide

### Creating a Lane
1. Click the "Add Lane" button at the right end of the board
2. Enter a lane name
3. Select a color (optional, defaults to blue)
4. Click "Create Lane"

### Adding a Card to a Lane
1. Click the "Add Card" button at the bottom of a lane
2. Enter the card description
3. Select a color (optional, defaults to white)
4. Click "Create Card"

### Moving a Card
- Click and drag a card to another lane or position within a lane
- The card will snap to the new position

### Renaming
- **Lane:** Double-click the lane name or use the menu (⋮) > "Rename"
- **Card:** Double-click the card text or use the menu (⋮) > "Edit"

### Changing Colors
- Click the menu (⋮) on either a lane or card
- Select "Change Color" and pick from the color palette

### Deleting
- Click the menu (⋮) on either a lane or card
- Click "Delete" and confirm

## Testing

The project includes comprehensive unit tests:

- **ColorPicker Component Tests** (3 tests)
  - Rendering color options
  - Marking current color as selected
  - Color selection handler

- **useLanes Hook Tests** (4 tests)
  - Fetching lanes on mount
  - Adding new lanes
  - Updating lanes
  - Deleting lanes

- **useCards Hook Tests** (5 tests)
  - Fetching cards on mount
  - Adding new cards
  - Updating cards
  - Deleting cards
  - Moving cards between lanes

All tests use Vitest and React Testing Library.

## Code Standards

- **TypeScript:** Strict mode enabled, full type coverage
- **Linting:** ESLint via TypeScript compiler (noUnusedLocals, noUnusedParameters, strict)
- **Testing:** Unit tests for components and hooks
- **Accessibility:** Radix UI components provide built-in ARIA support
- **Performance:** Memoization, efficient re-renders, lazy loading where applicable

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

The built application in `dist/` can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.) or served with a Node.js server.

## Troubleshooting

### Tests hanging
If tests hang, ensure you're using `npm test -- --run` for non-watch mode with a timeout.

### Database not persisting
The database is stored at `data/kanban.db`. Ensure the `data/` directory exists and is writable.

### API not responding
Make sure both dev servers are running:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3000`

### Build fails
Run `npm run type-check` to identify TypeScript errors before building.

## Development Notes

- The Vite dev server proxies `/api` requests to `http://localhost:3000`
- PGlite is an in-process database, no external PostgreSQL needed
- All database operations are cascading (deleting a lane deletes its cards)
- The frontend and backend can be run independently or together

## Next Steps

To continue development in a new session:

1. Install dependencies: `npm install`
2. Verify tests pass: `npm test -- --run`
3. Start dev server: `npm run dev`
4. Start backend server: `npm run server` (in another terminal)
5. Open `http://localhost:5173` in your browser

## License

MIT
