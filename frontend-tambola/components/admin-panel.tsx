'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player } from '@/types';
import { useStartSession, usePauseSession, useEndSession, useResetSession } from '@/hooks/use-session';
import { Play, Pause, Square, Users, Settings, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  session: {
    id: string;
    name: string;
    status: string;
    currentNumber: number | null;
    calledNumbers: number[];
    remainingNumbers: number[];
  };
  admin: Player;
  players: Player[];
}

export function AdminPanel({ session, admin, players }: AdminPanelProps) {
  const startSessionMutation = useStartSession();
  const pauseSessionMutation = usePauseSession();
  const endSessionMutation = useEndSession();
  const resetSessionMutation = useResetSession();

  const handleStartSession = () => {
    // Sessions start active in FastAPI backend, so this is mostly a no-op
    startSessionMutation.mutate();
  };

  const handlePauseSession = () => {
    pauseSessionMutation.mutate({
      sessionCode: session.id,
      adminPlayerId: admin.player_id,
    });
  };

  const handleEndSession = () => {
    endSessionMutation.mutate({
      sessionCode: session.id,
      adminPlayerId: admin.player_id,
    });
  };

  const handleResetSession = () => {
    resetSessionMutation.mutate({
      sessionCode: session.id,
      adminPlayerId: admin.player_id,
    });
  };

  const canStart = session.status === 'waiting' || session.status === 'paused';
  const canPause = session.status === 'active';
  const canEnd = session.status === 'active' || session.status === 'paused';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Admin Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Admin Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">{admin.name}</div>
            <div className="text-xs text-muted-foreground">
              Administrator
            </div>
          </div>
          <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {session.status.toUpperCase()}
          </Badge>
        </div>

        {/* Session Controls */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleStartSession}
              disabled={!canStart || startSessionMutation.isPending}
              variant={canStart ? 'default' : 'secondary'}
              size="sm"
            >
              <Play className="mr-1 h-3 w-3" />
              {session.status === 'paused' ? 'Resume' : 'Start'}
            </Button>
            
            <Button
              onClick={handlePauseSession}
              disabled={!canPause || pauseSessionMutation.isPending}
              variant="outline"
              size="sm"
            >
              <Pause className="mr-1 h-3 w-3" />
              Pause
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleResetSession}
              disabled={resetSessionMutation.isPending}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
            
            <Button
              onClick={handleEndSession}
              disabled={!canEnd || endSessionMutation.isPending}
              variant="destructive"
              size="sm"
            >
              <Square className="mr-1 h-3 w-3" />
              End
            </Button>
          </div>
        </div>
        
        {/* Game Stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center">
              <div className="font-semibold">{session.calledNumbers.length}</div>
              <div className="text-xs text-muted-foreground">Called</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{session.remainingNumbers.length}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
