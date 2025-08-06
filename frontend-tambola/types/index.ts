// Core entity types matching FastAPI backend
export interface Player {
  id: number;
  player_id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface PlayerTicket {
  ticket_id: string;
  player_id: string;
  grid: (number | null)[][];
  strikes: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

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

// API request/response interfaces matching FastAPI backend
export interface CreatePlayerRequest {
  name: string;
  is_admin?: boolean;
}

export interface GenerateTicketsRequest {
  count: number;
  session_code?: string;
}

export interface CreateSessionRequest {
  admin_player_id: string;
}

export interface TicketStrike {
  ticket_id: string;
  row: number;
  col: number;
  strike: boolean;
}

export interface NumberCallResponse {
  session_code: string;
  called_number: number;
  remaining_count: number;
  all_called_numbers: number[];
}

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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AnnounceResponse {
  spoken: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Legacy interfaces for compatibility
export interface Ticket {
  id: string;
  playerId: string;
  sessionId: string;
  numbers: number[][];
  struckNumbers: number[];
  isWinner: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  name: string;
  adminId: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  calledNumbers: number[];
  currentNumber: number | null;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface Admin {
  id: string;
  name: string;
  sessionId: string;
  createdAt: string;
}

export interface CreatePlayerResponse {
  player: Player;
  ticket: Ticket;
}

export interface JoinSessionRequest {
  sessionId: string;
  playerName: string;
}

export interface JoinSessionResponse {
  success: boolean;
  player: Player;
  ticket: Ticket;
  session: Session;
}

export interface CreateSessionResponse {
  session: Session;
  admin: Admin;
}

export interface CallNumberRequest {
  sessionId: string;
  adminId: string;
}

export interface CallNumberResponse {
  number: number;
  session: Session;
}

export interface StrikeNumberRequest {
  ticketId: string;
  playerId: string;
  number: number;
}

export interface StrikeNumberResponse {
  ticket: Ticket;
  isWinner: boolean;
}

export interface SessionStatusResponse {
  session: Session;
  players: Player[];
  recentNumbers: number[];
}

// UI state management types
export interface GameState {
  currentSession: Session | null;
  currentPlayer: Player | null;
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminState {
  session: Session | null;
  admin: Admin | null;
  players: Player[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  selectedNumber: number | null;
  showWinnerDialog: boolean;
  theme: 'light' | 'dark';
}

// Utility types
export type SessionStatus = Session['status'];
export type ApiError = {
  message: string;
  code?: string;
  details?: any;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Route params
export interface PlayerPageParams {
  playerId: string;
}

export interface GamePageParams {
  sessionId: string;
}

export interface AdminPageParams {
  sessionId: string;
}

// Search params
export interface GameSearchParams {
  playerId?: string;
}

export interface AdminSearchParams {
  adminId?: string;
}
