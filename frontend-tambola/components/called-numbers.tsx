'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CalledNumbersProps {
  calledNumbers: number[];
  currentNumber?: number | null;
  className?: string;
  title?: string;
  compact?: boolean;
}

export function CalledNumbers({ 
  calledNumbers = [], 
  currentNumber = null, 
  className,
  title = "Called Numbers",
  compact = false 
}: CalledNumbersProps) {
  // Create a grid of all possible numbers 1-90
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
  
  // Group numbers by tens for better layout
  const numberRows = [];
  for (let i = 0; i < 9; i++) {
    const start = i * 10 + 1;
    const end = start + 9;
    numberRows.push(allNumbers.slice(start - 1, end));
  }

  const getNumberStyle = (number: number) => {
    const isCalled = calledNumbers.includes(number);
    const isCurrent = number === currentNumber;
    
    if (isCurrent) {
      return "bg-blue-500 text-white border-blue-600 shadow-lg animate-pulse font-bold ring-2 ring-blue-300";
    }
    if (isCalled) {
      return "bg-white text-black border-gray-400 font-semibold dark:bg-gray-100 dark:text-black";
    }
    return "bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600";
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {calledNumbers.length} of 90 numbers called
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {calledNumbers
              .slice()
              .sort((a, b) => a - b)
              .map((number) => (
                <Badge
                  key={number}
                  variant={number === currentNumber ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-mono",
                    number === currentNumber && "animate-pulse shadow-lg"
                  )}
                >
                  {number}
                </Badge>
              ))}
          </div>
          {calledNumbers.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No numbers called yet
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Badge variant="outline">
            {calledNumbers.length}/90
          </Badge>
        </CardTitle>
        {currentNumber && (
          <div className="text-sm text-muted-foreground">
            Current number: <span className="font-bold text-primary">#{currentNumber}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="grid grid-cols-10 gap-2 text-sm font-mono">
          {numberRows.map((row, rowIndex) => (
            row.map((number) => (
              <div
                key={number}
                className={cn(
                  "flex items-center justify-center h-7 w-7 min-w-[28px] min-h-[28px] rounded-md border transition-all duration-300 text-xs font-bold shrink-0",
                  getNumberStyle(number)
                )}
              >
                {number}
              </div>
            ))
          ))}
        </div>
        
        {calledNumbers.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Recent Numbers (Last 10)</div>
            <div className="flex flex-wrap gap-1">
              {calledNumbers
                .slice(-10)
                .reverse()
                .map((number, index) => (
                  <Badge
                    key={`${number}-${index}`}
                    variant={number === currentNumber ? "default" : "outline"}
                    className={cn(
                      "text-xs font-mono",
                      number === currentNumber && "animate-pulse"
                    )}
                  >
                    {number}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
