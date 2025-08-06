'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BingoTicket } from '@/components/bingo-ticket';
import { GameStatus } from '@/components/game-status';
import { PlayerProfile } from '@/components/player-profile';
import { CalledNumbers } from '@/components/called-numbers';
import { Input } from '@/components/ui/input';
import { useSessionState, useJoinSession } from '@/hooks/use-session';
import { usePlayer, usePlayerTickets, useGenerateTickets, useCreatePlayer } from '@/hooks/use-player';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { GamePageParams } from '@/types';

interface GamePageProps {
  params: Promise<GamePageParams>;
}

export default function GamePage({ params }: GamePageProps) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId');
  const playerName = searchParams.get('playerName');
  const router = useRouter();

  // Get session state with faster polling for real-time updates
  const { data: sessionState, isLoading: statusLoading, refetch } = useSessionState(sessionId, 1500);
  // Get player data (only if we have a playerId)
  const { data: player, isLoading: playerLoading, error: playerError } = usePlayer(playerId || '');
  // Get player tickets (only if we have a playerId)
  const { data: tickets, isLoading: ticketsLoading } = usePlayerTickets(playerId || '');
  // Mutations
  const createPlayerMutation = useCreatePlayer();
  const joinSessionMutation = useJoinSession();
  const generateTicketsMutation = useGenerateTickets();

  const isLoading = statusLoading || (playerId ? playerLoading || ticketsLoading : false);
  const rawTicket = tickets?.[0]; // Get first ticket from backend
  
  // Convert PlayerTicket to legacy Ticket format for component compatibility
  const ticket = rawTicket ? {
    id: rawTicket.ticket_id,
    playerId: rawTicket.player_id,
    sessionId: sessionId,
    numbers: rawTicket.grid, // grid is already number[][]
    struckNumbers: Object.keys(rawTicket.strikes).map(Number).filter(num => rawTicket.strikes[num]),
    isWinner: false, // Would need to calculate based on game logic
    createdAt: rawTicket.created_at,
  } : null;

  // Handle player creation if needed
  const handleCreatePlayer = async (name: string) => {
    try {
      const newPlayer = await createPlayerMutation.mutateAsync({
        name,
        is_admin: false,
      });
      // Navigate to the same page but with the new playerId
      router.replace(`/game/${sessionId}?playerId=${newPlayer.player_id}`);
      return newPlayer;
    } catch (error) {
      console.error('Failed to create player:', error);
      return null;
    }
  };

  // If no playerId, show player creation form
  if (!playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Game: {sessionId}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Enter your name to join the game:
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              if (name.trim()) {
                await handleCreatePlayer(name.trim());
              }
            }} className="space-y-4">
              <Input
                name="name"
                type="text"
                placeholder="Your name"
                required
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={createPlayerMutation.isPending}>
                {createPlayerMutation.isPending ? 'Creating...' : 'Join Game'}
              </Button>
            </form>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Handle case where we need to join the session and/or generate tickets
  const handleJoinAndSetup = async () => {
    if (sessionState && player && playerId) {
      try {
        // Generate ticket first (required to join session)
        if (!tickets || tickets.length === 0) {
          await generateTicketsMutation.mutateAsync({
            playerId,
            data: {
              count: 1,
              session_code: sessionId,
            },
          });
        }
        
        // Then join the session
        await joinSessionMutation.mutateAsync({
          sessionCode: sessionId,
          playerId,
        });
      } catch (error) {
        console.error('Failed to join session or generate ticket:', error);
      }
    }
  };

  if (!sessionState || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Game Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Could not load the game session or player data.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no ticket, show join/setup UI
  if (!ticket && !generateTicketsMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ready to join the game session: {sessionId}
            </p>
            <Button onClick={handleJoinAndSetup} className="w-full" disabled={generateTicketsMutation.isPending || joinSessionMutation.isPending}>
              {generateTicketsMutation.isPending ? 'Generating Ticket...' : joinSessionMutation.isPending ? 'Joining...' : 'Join Game & Get Ticket'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create session object from sessionState for component compatibility
  const session = {
    id: sessionState.session_code,
    name: sessionState.session_code,
    status: sessionState.is_active ? 'active' : 'waiting',
    currentNumber: sessionState.current_number,
    calledNumbers: sessionState.called_numbers,
    remainingNumbers: sessionState.remaining_numbers,
  };
  
  // Create mock data for components that expect it
  const players = []; // GameSessionState doesn't provide player list
  const recentNumbers = sessionState.called_numbers.slice(-5); // Last 5 called numbers

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/player/${playerId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Player Dashboard
            </Button>
            <h1 className="text-2xl font-bold">{session.name}</h1>
          </div>
          
          <Button
            variant="outline"
            onClick={() => refetch()}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Game Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Current Number Display */}
            {session.currentNumber && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {session.currentNumber}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      Latest Number Called
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bingo Ticket */}
            {ticket && (
              <BingoTicket
                ticket={ticket}
                playerId={playerId}
                calledNumbers={session.calledNumbers}
                disabled={session.status !== 'active'}
              />
            )}

            {/* Winner Notification */}
            {ticket?.isWinner && (
              <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Congratulations!
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      You have a winning ticket!
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameStatus
              session={session}
              players={players}
              recentNumbers={recentNumbers}
            />
            
            <PlayerProfile player={player} ticket={ticket} />
          </div>
          
          {/* Called Numbers Display */}
          <div className="xl:col-span-1">
            <CalledNumbers
              calledNumbers={session.calledNumbers}
              currentNumber={session.currentNumber}
              title="Called Numbers"
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
