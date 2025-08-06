'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useCreatePlayer } from '@/hooks/use-player';
import { useCreateSession } from '@/hooks/use-session';
import { Loader2, Users, Plus } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sessionCode, setSessionCode] = useState('');

  const createPlayerMutation = useCreatePlayer();
  const createSessionMutation = useCreateSession();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) return;

    try {
      // First create admin player
      const admin = await createPlayerMutation.mutateAsync({
        name: adminName,
        is_admin: true,
      });
      
      // Then create session
      const session = await createSessionMutation.mutateAsync({
        admin_player_id: admin.player_id,
      });
      
      router.push(`/admin/${session.session_code}?adminId=${admin.player_id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim() || !playerName.trim()) return;

    try {
      // Create player first
      const player = await createPlayerMutation.mutateAsync({
        name: playerName,
        is_admin: false,
      });
      
      router.push(`/game/${sessionCode}?playerId=${player.player_id}`);
    } catch (error) {
      console.error('Failed to join session:', error);
      // If player creation fails, still allow them to try joining
      // The game page will handle creating the player
      router.push(`/game/${sessionCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Multiplayer Bingo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create or join a game to get started
          </p>
        </div>

        <Tabs defaultValue="join" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Join Game</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Game</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join a Game</CardTitle>
                <CardDescription>
                  Enter the session ID and your name to join an existing game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionCode">Session Code</Label>
                    <Input
                      id="sessionCode"
                      placeholder="Enter session code (e.g., GAME)"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Your Name</Label>
                    <Input
                      id="playerName"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createPlayerMutation.isPending}
                    >
                      {createPlayerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Game'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (sessionCode.trim()) {
                          router.push(`/game/${sessionCode}`);
                        }
                      }}
                      disabled={!sessionCode.trim()}
                    >
                      Quick Join (Enter Name Later)
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create a Game</CardTitle>
                <CardDescription>
                  Set up a new Bingo session and become the admin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Your Name (Admin)</Label>
                    <Input
                      id="adminName"
                      placeholder="Enter your name"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Game'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
