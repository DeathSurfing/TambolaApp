'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerProfile } from '@/components/player-profile';
import { CalledNumbers } from '@/components/called-numbers';
import { usePlayer, usePlayerTicket } from '@/hooks/use-player';
import { useSession } from '@/hooks/use-session';
import { ArrowLeft, Play } from 'lucide-react';
import { PlayerPageParams } from '@/types';

interface PlayerPageProps {
  params: Promise<PlayerPageParams>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = use(params);
  const router = useRouter();
  
  const { data: player, isLoading: playerLoading } = usePlayer(playerId);
  const { data: ticket, isLoading: ticketLoading } = usePlayerTicket(playerId);
  const { data: session, isLoading: sessionLoading } = useSession(
    player?.sessionId || ''
  );

  const isLoading = playerLoading || ticketLoading || sessionLoading;

  const handleJoinGame = () => {
    if (player && session) {
      router.push(`/game/${session.id}?playerId=${player.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The player with ID {playerId} could not be found.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          {session && (
            <Button onClick={handleJoinGame}>
              <Play className="mr-2 h-4 w-4" />
              Join Game
            </Button>
          )}
        </div>

        <PlayerProfile player={player} ticket={ticket} />

        {session && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{session.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm font-medium capitalize">{session.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Players:</span>
                    <span className="text-sm font-medium">{session.playerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Numbers Called:</span>
                    <span className="text-sm font-medium">{session.calledNumbers?.length || 0}</span>
                  </div>
                  {session.currentNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Number:</span>
                      <span className="text-lg font-bold text-primary">{session.currentNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <CalledNumbers
              calledNumbers={session.calledNumbers || []}
              currentNumber={session.currentNumber}
              title="Called Numbers"
              compact={true}
            />
          </>
        )}
      </div>
    </div>
  );
}
