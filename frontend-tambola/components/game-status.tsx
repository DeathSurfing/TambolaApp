'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Session, Player } from '@/types';
import { Users, Clock, Hash } from 'lucide-react';

interface GameStatusProps {
  session: Session;
  players: Player[];
  recentNumbers?: number[];
}

export function GameStatus({ session, players, recentNumbers = [] }: GameStatusProps) {
  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Game Status
          <Badge className={getStatusColor(session.status)}>
            {session.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{players.length}</div>
              <div className="text-xs text-muted-foreground">Players</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{session.calledNumbers.length}</div>
              <div className="text-xs text-muted-foreground">Numbers Called</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              Started: {formatTime(session.startedAt)}
            </div>
          </div>
          
          {session.completedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                Completed: {formatTime(session.completedAt)}
              </div>
            </div>
          )}
        </div>

        {recentNumbers.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Recent Numbers</div>
            <div className="flex flex-wrap gap-1">
              {recentNumbers.slice(-10).map((number, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {number}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Session ID: {session.id}
        </div>
      </CardContent>
    </Card>
  );
}
