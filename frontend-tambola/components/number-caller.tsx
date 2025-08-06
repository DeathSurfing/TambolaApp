'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCallNumber } from '@/hooks/use-game';
import { Session } from '@/types';
import { Loader2, Volume2, VolumeX } from 'lucide-react';

interface NumberCallerProps {
  session: Session;
  adminId: string;
  disabled?: boolean;
}

export function NumberCaller({ session, adminId, disabled = false }: NumberCallerProps) {
  const callNumberMutation = useCallNumber();
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  
  // TTS function with traditional bingo callouts
  const speakNumber = (number: number) => {
    if (!ttsEnabled || typeof window === 'undefined') return;
    
    try {
      // Traditional bingo callouts for some numbers
      const bingoCallouts: { [key: number]: string } = {
        1: 'Kelly\'s Eye, number 1',
        2: 'One Little Duck, number 2', 
        3: 'Cup of Tea, number 3',
        4: 'Knock at the Door, number 4',
        5: 'Man Alive, number 5',
        7: 'Lucky Seven',
        8: 'Garden Gate, number 8',
        9: 'Doctor\'s Orders, number 9',
        10: 'Boris\'s Den, number 10',
        11: 'Legs Eleven',
        13: 'Unlucky for Some, number 13',
        16: 'Sweet Sixteen',
        18: 'Coming of Age, number 18',
        21: 'Royal Salute, number 21',
        22: 'Two Little Ducks, number 22',
        25: 'Quarter Century, number 25',
        30: 'Dirty Gertie, number 30',
        39: 'Those Famous Steps, number 39',
        40: 'Life Begins at Forty',
        44: 'Droopy Drawers, number 44',
        45: 'Halfway There, number 45',
        50: 'Half Century, number 50',
        55: 'Snakes Alive, number 55',
        66: 'Clickety Click, number 66',
        77: 'Sunset Strip, number 77',
        88: 'Two Fat Ladies, number 88',
        90: 'Top of the Shop, number 90'
      };
      
      const callout = bingoCallouts[number] || `Number ${number}`;
      const utterance = new SpeechSynthesisUtterance(callout);
      utterance.rate = 0.7;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('TTS not supported or failed:', error);
    }
  };
  
  // Monitor for new called numbers and announce them
  useEffect(() => {
    if (session.currentNumber && session.currentNumber !== previousNumber) {
      speakNumber(session.currentNumber);
      setPreviousNumber(session.currentNumber);
    }
  }, [session.currentNumber, previousNumber, ttsEnabled]);
  
  const handleCallNumber = async () => {
    try {
      const result = await callNumberMutation.mutateAsync(session.id);
      // The TTS will be triggered by the useEffect when session updates
    } catch (error) {
      console.error('Failed to call number:', error);
    }
  };

  const canCallNumber = session.status === 'active' && !disabled;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Number Caller
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? 'Disable TTS' : 'Enable TTS'}
            >
              {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
              {session.status.toUpperCase()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col justify-center h-full">
        {session.currentNumber && (
          <div className="text-center">
            <div className="text-6xl font-bold text-primary mb-2">
              {session.currentNumber}
            </div>
            <div className="text-lg text-muted-foreground">
              Last called number
            </div>
          </div>
        )}
        
        {!session.currentNumber && (
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">Ready to start</div>
            <div>Click below to call the first number</div>
          </div>
        )}
        
        <Button
          onClick={handleCallNumber}
          disabled={!canCallNumber || callNumberMutation.isPending}
          className="w-full"
          size="lg"
        >
          {callNumberMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calling...
            </>
          ) : (
            'Call Next Number'
          )}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          Numbers called: {session.calledNumbers?.length || 0} / 90
        </div>
      </CardContent>
    </Card>
  );
}
