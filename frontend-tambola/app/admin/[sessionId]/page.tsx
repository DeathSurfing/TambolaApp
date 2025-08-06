'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumberCaller } from '@/components/number-caller';
import { GameStatus } from '@/components/game-status';
import { CalledNumbers } from '@/components/called-numbers';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, RefreshCw, Share } from 'lucide-react';
import { AdminPageParams } from '@/types';

interface AdminPageProps {
  params: Promise<AdminPageParams>;
}

export default function AdminPage({ params }: AdminPageProps) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const adminId = searchParams.get('adminId');
  const router = useRouter();

  const { data: admin, isLoading: adminLoading } = useQuery({
    queryKey: ['admin', adminId],
    queryFn: () => apiClient.getAdmin(adminId!),
    enabled: !!adminId,
  });
  
  const { data: sessionInfo, isLoading: statusLoading, refetch } = useQuery({
    queryKey: ['admin-session-info', sessionId, adminId],
    queryFn: () => apiClient.getAdminSessionInfo(sessionId, adminId!),
    enabled: !!sessionId && !!adminId,
    refetchInterval: 2000, // Poll for real-time updates every 2 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not active
    staleTime: 500, // Consider data stale after 0.5 seconds
  });

  const isLoading = statusLoading || adminLoading;

  const handleShareSession = async () => {
    const shareUrl = `${window.location.origin}/?join=${sessionId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bingo game!',
          text: `Join Bingo game: ${sessionId}`,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  if (!adminId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Missing Admin ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Admin ID is required to access the admin panel.
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!sessionInfo || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Could not load the session or admin data.
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

  // Create session object from sessionInfo for component compatibility
  const session = {
    id: sessionInfo.session_code,
    name: sessionInfo.session_code,
    status: sessionInfo.is_active ? 'active' : 'waiting',
    currentNumber: sessionInfo.current_number,
    calledNumbers: sessionInfo.called_numbers || [],
    remainingNumbers: sessionInfo.remaining_numbers || [],
  };
  
  
  const players = sessionInfo.players;
  const recentNumbers = sessionInfo.called_numbers.slice(-5); // Get last 5 called numbers

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Admin Panel - {session.name}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleShareSession}
              size="sm"
            >
              <Share className="mr-2 h-4 w-4" />
              Share Game
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Simple Clean Grid Layout */}
        <div className="grid grid-cols-3 gap-6 h-[800px]">
          {/* Players Panel - Left Column */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {player.is_admin ? 'Admin' : 'Player'}
                      </div>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No players yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Number Caller - Center */}
          <div className="flex flex-col gap-6">
            <NumberCaller
              session={session}
              adminId={adminId}
              disabled={session.status !== 'active'}
            />
            
            {/* Session Info - Bottom */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Session ID</div>
                    <div className="font-mono font-bold text-lg">{sessionId}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="font-bold">{session.calledNumbers.length}/90</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Called Numbers Display - Right Column */}
          <div>
            <CalledNumbers
              calledNumbers={session.calledNumbers}
              currentNumber={session.currentNumber}
              title="Called Numbers"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
