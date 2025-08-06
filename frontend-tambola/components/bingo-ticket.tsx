'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@/types';
import { useStrikeNumber } from '@/hooks/use-player';
import { cn } from '@/lib/utils';
import { TambolaTicket } from '@/lib/tambola-generator';

interface BingoTicketProps {
  ticket: Ticket;
  playerId: string;
  calledNumbers: number[];
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export function BingoTicket({ 
  ticket, 
  playerId, 
  calledNumbers = [], 
  disabled = false,
  className,
  compact = false
}: BingoTicketProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(
    new Set(ticket.struckNumbers || [])
  );
  
  const strikeNumberMutation = useStrikeNumber();

  const handleNumberClick = async (number: number) => {
    if (disabled || !calledNumbers.includes(number)) return;
    
    if (selectedNumbers.has(number)) {
      // Unselect number
      setSelectedNumbers(prev => {
        const newSet = new Set(prev);
        newSet.delete(number);
        return newSet;
      });
    } else {
      // Strike number (optimistic update)
      setSelectedNumbers(prev => new Set([...prev, number]));
      
      // TODO: Implement proper strike API call when backend strike logic is clarified
      // The current TicketStrike interface expects row/col coordinates but we have number values
    }
  };

  const isNumberCallable = (number: number) => calledNumbers.includes(number);
  const isNumberStruck = (number: number) => selectedNumbers.has(number);

  const getNumberStyle = (number: number | null, row: number, col: number) => {
    if (number === null) {
      return cn(
        "h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm font-mono font-medium",
        "border border-border bg-muted/30 text-transparent cursor-default"
      );
    }

    return cn(
      "h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm font-mono font-medium",
      "border border-border transition-all duration-200",
      "hover:bg-accent hover:text-accent-foreground",
      // Number is struck
      isNumberStruck(number) && [
        "bg-primary text-primary-foreground",
        "ring-2 ring-primary/20 shadow-sm"
      ],
      // Number is called but not struck
      isNumberCallable(number) && !isNumberStruck(number) && [
        "bg-secondary text-secondary-foreground",
        "ring-2 ring-blue-500/50 animate-pulse shadow-sm"
      ],
      // Number not called yet
      !isNumberCallable(number) && [
        "bg-background text-foreground opacity-60"
      ],
      // Disabled state
      disabled && "cursor-not-allowed opacity-50",
      // Interactive state
      !disabled && isNumberCallable(number) && "cursor-pointer active:scale-95"
    );
  };

  return (
    <Card className={cn("w-full max-w-lg mx-auto", className)}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg", compact && "text-base")}>
            Tambola Ticket
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {selectedNumbers.size}/15
            </Badge>
            {ticket.isWinner && (
              <Badge variant="default" className="bg-green-600 text-white">
                WINNER!
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "space-y-2")}>
        {/* Column Headers */}
        <div className="grid grid-cols-9 gap-1 text-center text-xs font-medium text-muted-foreground">
          <div>1-10</div>
          <div>11-20</div>
          <div>21-30</div>
          <div>31-40</div>
          <div>41-50</div>
          <div>51-60</div>
          <div>61-70</div>
          <div>71-80</div>
          <div>81-90</div>
        </div>
        
        {/* Tambola Grid: 3 rows x 9 columns */}
        <div className="grid grid-cols-9 gap-1 p-2 bg-muted/20 rounded-lg border">
          {ticket.numbers.map((row, rowIndex) =>
            row.map((number, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant="outline"
                size="sm"
                className={getNumberStyle(number, rowIndex, colIndex)}
                onClick={() => number && handleNumberClick(number)}
                disabled={disabled || !number || !isNumberCallable(number)}
              >
                {number || ''}
              </Button>
            ))
          )}
        </div>
        
        {/* Stats */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Struck: {selectedNumbers.size} numbers</span>
          <span>Called: {calledNumbers.filter(n => 
            ticket.numbers.flat().filter(Boolean).includes(n)
          ).length} of your numbers</span>
        </div>
      </CardContent>
    </Card>
  );
}
