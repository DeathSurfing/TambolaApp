import { ApiError } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Player endpoints matching FastAPI backend
  async createPlayer(data: import('@/types').CreatePlayerRequest) {
    return this.request<import('@/types').Player>('/api/players/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPlayer(playerId: string) {
    return this.request<import('@/types').Player>(`/api/players/${playerId}`);
  }

  async getAdmin(adminId: string) {
    return this.request<import('@/types').Player>(`/api/players/${adminId}`);
  }

  async getPlayerTickets(playerId: string) {
    return this.request<import('@/types').PlayerTicket[]>(`/api/players/${playerId}/tickets`);
  }

  async generateTickets(playerId: string, data: import('@/types').GenerateTicketsRequest) {
    return this.request<import('@/types').PlayerTicket[]>(`/api/players/${playerId}/tickets`, {
      method: 'POST',
      body: JSON.stringify({
        player_id: playerId,
        ...data,
      }),
    });
  }

  async strikeTicket(data: import('@/types').TicketStrike) {
    return this.request<import('@/types').SuccessResponse>('/api/players/tickets/strike', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Session endpoints matching FastAPI backend
  async createSession(data: import('@/types').CreateSessionRequest) {
    return this.request<import('@/types').GameSession>('/api/sessions/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessionState(sessionCode: string) {
    return this.request<import('@/types').GameSessionState>(`/api/sessions/${sessionCode}`);
  }

  async joinSession(sessionCode: string, playerId: string) {
    return this.request<import('@/types').SuccessResponse>(`/api/sessions/${sessionCode}/join?player_id=${playerId}`, {
      method: 'POST',
    });
  }

  async callNumber(sessionCode: string) {
    return this.request<import('@/types').NumberCallResponse>(`/api/sessions/${sessionCode}/call-number`, {
      method: 'POST',
    });
  }

  async resetSession(sessionCode: string, adminPlayerId: string) {
    return this.request<import('@/types').SuccessResponse>(`/api/sessions/${sessionCode}/reset`, {
      method: 'POST',
      body: JSON.stringify({ admin_player_id: adminPlayerId }),
    });
  }

  async deactivateSession(sessionCode: string, adminPlayerId: string) {
    return this.request<import('@/types').SuccessResponse>(`/api/sessions/${sessionCode}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ admin_player_id: adminPlayerId }),
    });
  }

  // Admin endpoints matching FastAPI backend
  async adminGenerateTickets(data: import('@/types').AdminTicketGenerate, adminPlayerId: string) {
    return this.request<import('@/types').PlayerTicket[]>(`/api/admin/generate-tickets?admin_player_id=${adminPlayerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminSessionInfo(sessionCode: string, adminPlayerId: string) {
    return this.request<import('@/types').AdminSessionInfo>(`/api/admin/session/${sessionCode}?admin_player_id=${adminPlayerId}`);
  }

  async getAllPlayers(adminPlayerId: string) {
    return this.request<import('@/types').Player[]>(`/api/admin/players?admin_player_id=${adminPlayerId}`);
  }

  async getAllSessions(adminPlayerId: string) {
    return this.request<import('@/types').AdminSessionInfo[]>(`/api/admin/sessions?admin_player_id=${adminPlayerId}`);
  }

  async deletePlayer(playerId: string, adminPlayerId: string) {
    return this.request<import('@/types').SuccessResponse>(`/api/admin/player/${playerId}?admin_player_id=${adminPlayerId}`, {
      method: 'DELETE',
    });
  }

  async makePlayerAdmin(playerId: string, adminPlayerId: string) {
    return this.request<import('@/types').SuccessResponse>(`/api/admin/player/${playerId}/make-admin?admin_player_id=${adminPlayerId}`, {
      method: 'POST',
    });
  }

  // Voice announcer endpoint
  async announceNumber(number: number) {
    return this.request<import('@/types').AnnounceResponse>(`/api/announce/${number}`);
  }

  // Legacy endpoints for compatibility
  async getSession(sessionId: string) {
    return this.getSessionState(sessionId);
  }

  async getPlayerTicket(playerId: string) {
    const tickets = await this.getPlayerTickets(playerId);
    return tickets[0]; // Return first ticket for compatibility
  }

  async getCalledNumbers(sessionId: string) {
    const sessionState = await this.getSessionState(sessionId);
    return sessionState.called_numbers;
  }
}

export const apiClient = new ApiClient();
