/**
 * Tambola Ticket Generator
 * Generates valid 9x3 grid tickets with proper column distribution
 */

export interface TambolaTicket {
  id: string;
  numbers: (number | null)[][]; // 3 rows x 9 columns, null represents blank spaces
  struckNumbers: number[];
  isWinner: boolean;
}

/**
 * Generates a valid Tambola ticket following traditional rules:
 * - 9 columns x 3 rows grid
 * - Each row has exactly 5 numbers and 4 blanks
 * - Column 1: 1-10, Column 2: 11-20, ..., Column 9: 81-90
 */
export function generateTambolaTicket(id?: string): TambolaTicket {
  const ticket: TambolaTicket = {
    id: id || generateTicketId(),
    numbers: Array(3).fill(null).map(() => Array(9).fill(null)),
    struckNumbers: [],
    isWinner: false,
  };

  // Define column ranges
  const columnRanges = [
    [1, 10],   // Column 1: 1-10
    [11, 20],  // Column 2: 11-20
    [21, 30],  // Column 3: 21-30
    [31, 40],  // Column 4: 31-40
    [41, 50],  // Column 5: 41-50
    [51, 60],  // Column 6: 51-60
    [61, 70],  // Column 7: 61-70
    [71, 80],  // Column 8: 71-80
    [81, 90],  // Column 9: 81-90
  ];

  // For each row, select exactly 5 columns to have numbers
  for (let row = 0; row < 3; row++) {
    // Randomly select 5 columns out of 9 for this row
    const selectedColumns = selectRandomColumns(5, 9);
    
    for (const col of selectedColumns) {
      const [min, max] = columnRanges[col];
      // Generate a random number within the column range
      let number;
      do {
        number = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (isNumberAlreadyUsed(ticket.numbers, number));
      
      ticket.numbers[row][col] = number;
    }
  }

  // Ensure each column has at least one number across all rows
  ensureColumnDistribution(ticket, columnRanges);

  // Sort numbers within each column
  sortColumnsVertically(ticket);

  return ticket;
}

/**
 * Generates multiple Tambola tickets
 */
export function generateMultipleTambolaTickets(count: number): TambolaTicket[] {
  const tickets: TambolaTicket[] = [];
  for (let i = 0; i < count; i++) {
    tickets.push(generateTambolaTicket(`ticket-${i + 1}`));
  }
  return tickets;
}

/**
 * Randomly selects specified number of columns
 */
function selectRandomColumns(count: number, total: number): number[] {
  const columns: number[] = [];
  while (columns.length < count) {
    const col = Math.floor(Math.random() * total);
    if (!columns.includes(col)) {
      columns.push(col);
    }
  }
  return columns.sort((a, b) => a - b);
}

/**
 * Checks if a number is already used in the ticket
 */
function isNumberAlreadyUsed(grid: (number | null)[][], number: number): boolean {
  for (const row of grid) {
    if (row.includes(number)) {
      return true;
    }
  }
  return false;
}

/**
 * Ensures each column has at least one number and proper distribution
 */
function ensureColumnDistribution(ticket: TambolaTicket, columnRanges: number[][]) {
  // Check each column has at least one number
  for (let col = 0; col < 9; col++) {
    const hasNumber = ticket.numbers.some(row => row[col] !== null);
    
    if (!hasNumber) {
      // Find a row with less than 5 numbers to add one
      for (let row = 0; row < 3; row++) {
        const numbersInRow = ticket.numbers[row].filter(n => n !== null).length;
        if (numbersInRow < 5) {
          const [min, max] = columnRanges[col];
          let number;
          do {
            number = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (isNumberAlreadyUsed(ticket.numbers, number));
          
          ticket.numbers[row][col] = number;
          break;
        }
      }
    }
  }

  // Ensure each row has exactly 5 numbers
  for (let row = 0; row < 3; row++) {
    const numbersInRow = ticket.numbers[row].filter(n => n !== null);
    
    // If row has more than 5 numbers, remove extras
    while (numbersInRow.length > 5) {
      const nonNullIndices = ticket.numbers[row]
        .map((val, idx) => val !== null ? idx : -1)
        .filter(idx => idx !== -1);
      
      const randomIndex = nonNullIndices[Math.floor(Math.random() * nonNullIndices.length)];
      ticket.numbers[row][randomIndex] = null;
      numbersInRow.pop();
    }
    
    // If row has less than 5 numbers, add more
    while (numbersInRow.length < 5) {
      const nullIndices = ticket.numbers[row]
        .map((val, idx) => val === null ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (nullIndices.length === 0) break;
      
      const randomColIndex = nullIndices[Math.floor(Math.random() * nullIndices.length)];
      const [min, max] = columnRanges[randomColIndex];
      
      let number;
      do {
        number = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (isNumberAlreadyUsed(ticket.numbers, number));
      
      ticket.numbers[row][randomColIndex] = number;
      numbersInRow.push(number);
    }
  }
}

/**
 * Sorts numbers within each column vertically (top to bottom)
 */
function sortColumnsVertically(ticket: TambolaTicket) {
  for (let col = 0; col < 9; col++) {
    const columnNumbers = ticket.numbers
      .map(row => row[col])
      .filter(num => num !== null) as number[];
    
    if (columnNumbers.length > 1) {
      columnNumbers.sort((a, b) => a - b);
      
      let numberIndex = 0;
      for (let row = 0; row < 3; row++) {
        if (ticket.numbers[row][col] !== null) {
          ticket.numbers[row][col] = columnNumbers[numberIndex++];
        }
      }
    }
  }
}

/**
 * Generates a unique ticket ID
 */
function generateTicketId(): string {
  return `ticket-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Validates if a ticket follows proper Tambola rules
 */
export function validateTambolaTicket(ticket: TambolaTicket): boolean {
  // Check grid dimensions
  if (ticket.numbers.length !== 3 || ticket.numbers[0].length !== 9) {
    return false;
  }

  // Check each row has exactly 5 numbers
  for (const row of ticket.numbers) {
    const numbersCount = row.filter(n => n !== null).length;
    if (numbersCount !== 5) {
      return false;
    }
  }

  // Check column number ranges
  const columnRanges = [
    [1, 10], [11, 20], [21, 30], [31, 40], [41, 50],
    [51, 60], [61, 70], [71, 80], [81, 90]
  ];

  for (let col = 0; col < 9; col++) {
    const [min, max] = columnRanges[col];
    for (let row = 0; row < 3; row++) {
      const number = ticket.numbers[row][col];
      if (number !== null && (number < min || number > max)) {
        return false;
      }
    }
  }

  // Check for duplicate numbers
  const allNumbers = ticket.numbers.flat().filter(n => n !== null) as number[];
  const uniqueNumbers = new Set(allNumbers);
  if (allNumbers.length !== uniqueNumbers.size) {
    return false;
  }

  return true;
}

/**
 * Converts a legacy Ticket format to TambolaTicket format
 */
export function convertLegacyTicketToTambola(legacyTicket: any): TambolaTicket {
  // If it's already in the correct format, return as is
  if (legacyTicket.numbers && Array.isArray(legacyTicket.numbers)) {
    return {
      id: legacyTicket.id || legacyTicket.ticket_id || generateTicketId(),
      numbers: legacyTicket.numbers,
      struckNumbers: legacyTicket.struckNumbers || [],
      isWinner: legacyTicket.isWinner || false,
    };
  }
  
  // If it has a grid property (from PlayerTicket), convert it
  if (legacyTicket.grid && Array.isArray(legacyTicket.grid)) {
    return {
      id: legacyTicket.ticket_id || generateTicketId(),
      numbers: legacyTicket.grid,
      struckNumbers: Object.keys(legacyTicket.strikes || {})
        .filter(key => legacyTicket.strikes[key])
        .map(Number)
        .filter(n => !isNaN(n)),
      isWinner: false,
    };
  }
  
  // If it's a flat array, try to reconstruct the grid
  if (Array.isArray(legacyTicket)) {
    // Generate a new proper ticket since we can't reconstruct the grid reliably
    return generateTambolaTicket();
  }
  
  // Fallback: generate a new ticket
  return generateTambolaTicket();
}

/**
 * Converts TambolaTicket to legacy Ticket format for API compatibility
 */
export function convertTambolaToLegacyTicket(tambolaTicket: TambolaTicket, playerId?: string, sessionId?: string): any {
  return {
    id: tambolaTicket.id,
    playerId: playerId || '',
    sessionId: sessionId || '',
    numbers: tambolaTicket.numbers,
    struckNumbers: tambolaTicket.struckNumbers,
    isWinner: tambolaTicket.isWinner,
    createdAt: new Date().toISOString(),
  };
}
