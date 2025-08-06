# V0 Frontend Prompt: Multiplayer Bingo/Tambola App

Create a complete multiplayer Bingo/Tambola game frontend using **Next.js 14**, **Tailwind CSS**, and **ShadCN UI components**. The app should connect to a FastAPI backend and support multiple players with real-time gameplay.

## 🎯 Core Requirements

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS only (no custom colors - will be themed later with Tweak CN)
- **Components**: ShadCN UI components (use default styling, no custom colors)
- **TypeScript**: Full TypeScript implementation
- **State Management**: React Query/TanStack Query for API calls
- **Responsive**: Mobile-first responsive design

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing/home page
│   ├── player/
│   │   └── [playerId]/
│   │       └── page.tsx           # Player dashboard
│   ├── game/
│   │   └── [sessionCode]/
│   │       └── page.tsx           # Game session view
│   ├── admin/
│   │   └── [sessionCode]/
│   │       └── page.tsx           # Admin panel
│   └── api/
│       └── config.ts              # API configuration
├── components/
│   ├── ui/                        # ShadCN components
│   ├── game/
│   │   ├── BingoTicket.tsx        # Interactive bingo ticket
│   │   ├── NumberCaller.tsx       # Number calling interface
│   │   ├── GameStatus.tsx         # Game state display
│   │   └── PlayerList.tsx         # Session players list
│   ├── player/
│   │   ├── PlayerProfile.tsx      # Player info display
│   │   ├── TicketManager.tsx      # Player's tickets
│   │   └── JoinSession.tsx        # Join game session
│   └── admin/
│       ├── AdminPanel.tsx         # Admin controls
│       ├── SessionManager.tsx     # Manage sessions
│       └── PlayerManager.tsx      # Manage players
├── lib/
│   ├── api.ts                     # API client functions
│   ├── types.ts                   # TypeScript interfaces
│   └── utils.ts                   # Utility functions
├── hooks/
│   ├── usePlayer.ts               # Player-related hooks
│   ├── useSession.ts              # Session-related hooks
│   └── useTickets.ts              # Ticket-related hooks
└── .env.local                     # Environment variables
```

## 🔧 Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration
NEXT_PUBLIC_APP_NAME=Multiplayer Bingo
NEXT_PUBLIC_APP_VERSION=2.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ADMIN_PANEL=true
NEXT_PUBLIC_ENABLE_VOICE_ANNOUNCER=true
NEXT_PUBLIC_AUTO_REFRESH_INTERVAL=5000

# Development
NEXT_PUBLIC_DEBUG_MODE=false
```

## 📋 TypeScript Schemas & Types

```typescript
// lib/types.ts

// Player Types
export interface Player {
  id: number;
  player_id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface CreatePlayerRequest {
  name: string;
  is_admin?: boolean;
}

// Ticket Types
export interface PlayerTicket {
  ticket_id: string;
  player_id: string;
  grid: (number | null)[][];
  strikes: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface TicketStrike {
  ticket_id: string;
  row: number;
  col: number;
  strike: boolean;
}

export interface GenerateTicketsRequest {
  player_id: string;
  count: number;
  session_code?: string;
}

// Session Types
export interface GameSession {
  id: number;
  session_code: string;
  admin_player_id: string;
  current_number: number | null;
  called_numbers: number[];
  remaining_numbers: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameSessionState {
  session_code: string;
  current_number: number | null;
  called_numbers: number[];
  remaining_numbers: number[];
  players_count: number;
  tickets_count: number;
  is_active: boolean;
}

export interface CreateSessionRequest {
  admin_player_id: string;
}

export interface NumberCallResponse {
  session_code: string;
  called_number: number;
  remaining_count: number;
  all_called_numbers: number[];
}

// Admin Types
export interface AdminSessionInfo {
  session_code: string;
  admin_player_id: string;
  players: Player[];
  total_tickets: number;
  current_number: number | null;
  called_numbers: number[];
  remaining_numbers: number[];
  is_active: boolean;
}

export interface AdminTicketGenerate {
  session_code: string;
  player_id: string;
  count: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AnnounceResponse {
  spoken: string;
}

// UI State Types
export interface AppState {
  currentPlayer: Player | null;
  currentSession: string | null;
  isLoading: boolean;
  error: string | null;
}
```

## 🛣️ Routing Logic & Pages

### 1. Landing Page (`app/page.tsx`)

```typescript
// Features:
// - Create new player form
// - Join existing session input
// - Recent sessions list
// - Admin login option

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome header */}
        {/* Create player form */}
        {/* Join session form */}
        {/* Admin access */}
      </div>
    </div>
  );
}
```

### 2. Player Dashboard (`app/player/[playerId]/page.tsx`)

```typescript
// URL: /player/ABC123
// Features:
// - Player profile display
// - Player's tickets grid
// - Join session option
// - Ticket generation
// - Session history

interface Props {
  params: { playerId: string };
}

export default function PlayerPage({ params }: Props) {
  const { playerId } = params;
  // Fetch player data and tickets
  // Display player dashboard
}
```

### 3. Game Session (`app/game/[sessionCode]/page.tsx`)

```typescript
// URL: /game/GAME
// Features:
// - Live game board
// - Current/called numbers display
// - Player's tickets (if joined)
// - Strike number interface
// - Game status
// - Player list

interface Props {
  params: { sessionCode: string };
  searchParams: { playerId?: string };
}

export default function GamePage({ params, searchParams }: Props) {
  const { sessionCode } = params;
  const { playerId } = searchParams;
  // Real-time game interface
}
```

### 4. Admin Panel (`app/admin/[sessionCode]/page.tsx`)

```typescript
// URL: /admin/GAME?adminId=ABC123
// Features:
// - Session overview
// - Call next number button
// - Player management
// - Generate tickets for players
// - Session controls (reset, deactivate)
// - Game statistics

interface Props {
  params: { sessionCode: string };
  searchParams: { adminId: string };
}

export default function AdminPage({ params, searchParams }: Props) {
  const { sessionCode } = params;
  const { adminId } = searchParams;
  // Admin interface
}
```

## 🎮 Key Components

### BingoTicket Component

```typescript
interface BingoTicketProps {
  ticket: PlayerTicket;
  onStrike?: (row: number, col: number) => void;
  readonly?: boolean;
  calledNumbers?: number[];
}

// Features:
// - 9x3 grid display
// - Click to strike/unstrike
// - Visual feedback for strikes
// - Highlight called numbers
// - Responsive design
```

### NumberCaller Component

```typescript
interface NumberCallerProps {
  currentNumber: number | null;
  calledNumbers: number[];
  onCallNumber: () => void;
  isAdmin: boolean;
}

// Features:
// - Large current number display
// - Call next number button (admin)
// - Called numbers history
// - Number pronunciation display
```

### GameStatus Component

```typescript
interface GameStatusProps {
  session: GameSessionState;
  isAdmin?: boolean;
}

// Features:
// - Session code display
// - Player/ticket counts
// - Game progress
// - Active/inactive status
```

## 🔌 API Client Functions

```typescript
// lib/api.ts

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Player APIs
  async createPlayer(data: CreatePlayerRequest): Promise<Player> { }
  async getPlayer(playerId: string): Promise<Player> { }
  async getPlayerTickets(playerId: string): Promise<PlayerTicket[]> { }
  async generateTickets(playerId: string, data: GenerateTicketsRequest): Promise<PlayerTicket[]> { }
  async strikeTicket(data: TicketStrike): Promise<ApiResponse<any>> { }

  // Session APIs
  async createSession(data: CreateSessionRequest): Promise<GameSession> { }
  async getSessionState(sessionCode: string): Promise<GameSessionState> { }
  async joinSession(sessionCode: string, playerId: string): Promise<ApiResponse<any>> { }
  async callNumber(sessionCode: string): Promise<NumberCallResponse> { }
  async resetSession(sessionCode: string, adminId: string): Promise<ApiResponse<any>> { }

  // Admin APIs
  async adminGenerateTickets(data: AdminTicketGenerate, adminId: string): Promise<PlayerTicket[]> { }
  async getAdminSessionInfo(sessionCode: string, adminId: string): Promise<AdminSessionInfo> { }
  async getAllPlayers(adminId: string): Promise<Player[]> { }
  async getAllSessions(adminId: string): Promise<AdminSessionInfo[]> { }

  // Utility APIs
  async announceNumber(number: number): Promise<AnnounceResponse> { }
}
```

## 🎣 React Query Hooks

```typescript
// hooks/usePlayer.ts
export const usePlayer = (playerId: string) => {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => apiClient.getPlayer(playerId),
    enabled: !!playerId,
  });
};

export const usePlayerTickets = (playerId: string) => {
  return useQuery({
    queryKey: ['playerTickets', playerId],
    queryFn: () => apiClient.getPlayerTickets(playerId),
    enabled: !!playerId,
  });
};

// hooks/useSession.ts
export const useSessionState = (sessionCode: string, interval = 5000) => {
  return useQuery({
    queryKey: ['sessionState', sessionCode],
    queryFn: () => apiClient.getSessionState(sessionCode),
    refetchInterval: interval,
    enabled: !!sessionCode,
  });
};
```

## 🎨 UI/UX Guidelines

### Design Principles
- **Clean & Minimal**: Use ShadCN default styling without custom colors
- **Responsive**: Mobile-first approach with breakpoints
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Fast**: Optimistic updates with React Query
- **Intuitive**: Clear visual hierarchy and user flows

### Component Guidelines
- Use ShadCN Button, Card, Input, Dialog, Badge, Table components
- No custom color classes (will be themed later)
- Consistent spacing using Tailwind spacing scale
- Use semantic HTML elements
- Implement loading states and error boundaries

### Layout Structure
- Header with app name and navigation
- Main content area with proper containers
- Footer with version info
- Responsive sidebar for admin panels
- Modal dialogs for forms and confirmations

## 🔄 Real-time Updates

Implement polling strategy:
- Session state: Every 5 seconds
- Player tickets: On user action
- Admin data: Every 3 seconds
- Error handling with retry logic

## 📱 Mobile Optimization

- Touch-friendly ticket grids
- Responsive number display
- Swipeable ticket carousel
- Mobile-optimized admin controls
- Progressive Web App features

## 🧪 Key User Flows

### Player Flow
1. Create account → Get player ID
2. Generate tickets → Join session
3. Play game → Strike numbers
4. View progress → Check wins

### Admin Flow
1. Create admin account → Create session
2. Generate tickets for players
3. Manage session → Call numbers
4. Monitor game → Handle wins

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

Create a fully functional, production-ready multiplayer Bingo/Tambola frontend that connects seamlessly with the provided FastAPI backend. Focus on clean code, proper error handling, and excellent user experience across all devices.
