'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player, Ticket } from '@/types';
import { User, Trophy, Calendar } from 'lucide-react';

interface PlayerProfileProps {
  player: Player;
  ticket?: Ticket;
}

export function PlayerProfile({ player, ticket }: PlayerProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Player Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-lg font-semibold">{player.name}</div>
          <div className="text-sm text-muted-foreground">ID: {player.player_id}</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Status</span>
          <Badge variant={player.is_admin ? 'default' : 'secondary'}>
            {player.is_admin ? 'Admin' : 'Player'}
          </Badge>
        </div>

        {ticket && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ticket Status</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Numbers Struck</span>
              <Badge variant="outline">
                {ticket.struckNumbers.length}
              </Badge>
            </div>
            
            {ticket.isWinner && (
              <Badge className="w-full justify-center bg-green-500">
                🎉 WINNER! 🎉
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Joined {formatDate(player.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
