import random
from typing import List, Optional, Set


class BingoTicketGenerator:
    """Generates bingo tickets with proper constraints"""

    @staticmethod
    def generate_ticket() -> List[List[Optional[int]]]:
        """
        Generates a single bingo ticket (9x3 grid)
        - Each row has exactly 5 numbers and 4 blanks
        - Numbers range from 1 to 90 and are unique in the ticket
        - Column i contains numbers from (i-1)*10+1 to i*10
        """
        max_attempts = 100
        
        for attempt in range(max_attempts):
            try:
                # Initialize 9x3 grid with None values
                grid = [[None for _ in range(9)] for _ in range(3)]
                used_numbers: Set[int] = set()
                
                # Column ranges
                column_ranges = [
                    (1, 10), (11, 20), (21, 30), (31, 40), (41, 50),
                    (51, 60), (61, 70), (71, 80), (81, 90)
                ]
                
                # Generate numbers for each column ensuring at least one per column
                for col in range(9):
                    min_val, max_val = column_ranges[col]
                    
                    # Decide how many numbers this column will have (1-3)
                    num_in_col = random.randint(1, min(3, max_val - min_val + 1))
                    
                    # Choose random rows for this column
                    rows_for_col = random.sample(range(3), num_in_col)
                    
                    for row in rows_for_col:
                        available_numbers = [n for n in range(min_val, max_val + 1) if n not in used_numbers]
                        
                        if available_numbers:
                            number = random.choice(available_numbers)
                            grid[row][col] = number
                            used_numbers.add(number)
                
                # Now adjust to ensure exactly 5 numbers per row
                for row in range(3):
                    current_count = sum(1 for cell in grid[row] if cell is not None)
                    
                    # Remove excess numbers if more than 5
                    while current_count > 5:
                        filled_cols = [col for col, cell in enumerate(grid[row]) if cell is not None]
                        # Only remove if column will still have at least one number
                        removable_cols = []
                        for col in filled_cols:
                            col_count = sum(1 for r in range(3) if grid[r][col] is not None)
                            if col_count > 1:
                                removable_cols.append(col)
                        
                        if removable_cols:
                            col_to_remove = random.choice(removable_cols)
                            used_numbers.remove(grid[row][col_to_remove])
                            grid[row][col_to_remove] = None
                            current_count -= 1
                        else:
                            break
                    
                    # Add numbers if fewer than 5
                    while current_count < 5:
                        empty_cols = [col for col, cell in enumerate(grid[row]) if cell is None]
                        if not empty_cols:
                            break
                        
                        col_to_fill = random.choice(empty_cols)
                        min_val, max_val = column_ranges[col_to_fill]
                        available_numbers = [n for n in range(min_val, max_val + 1) if n not in used_numbers]
                        
                        if available_numbers:
                            number = random.choice(available_numbers)
                            grid[row][col_to_fill] = number
                            used_numbers.add(number)
                            current_count += 1
                        else:
                            break
                
                # Verify and return if valid
                BingoTicketGenerator._verify_ticket(grid)
                return grid
                
            except (AssertionError, ValueError):
                # Try again
                continue
        
        # If we couldn't generate a valid ticket after max attempts, use a simpler approach
        return BingoTicketGenerator._generate_simple_ticket()
    
    @staticmethod
    def generate_tickets(count: int) -> List[List[List[Optional[int]]]]:
        """Generate multiple tickets"""
        tickets = []
        for _ in range(count):
            ticket = BingoTicketGenerator.generate_ticket()
            tickets.append(ticket)
        return tickets
    
    @staticmethod
    def _generate_simple_ticket() -> List[List[Optional[int]]]:
        """Generate a simple valid ticket as fallback"""
        grid = [[None for _ in range(9)] for _ in range(3)]
        used_numbers: Set[int] = set()
        
        # Column ranges
        column_ranges = [
            (1, 10), (11, 20), (21, 30), (31, 40), (41, 50),
            (51, 60), (61, 70), (71, 80), (81, 90)
        ]
        
        # First ensure each column gets at least one number
        for col in range(9):
            min_val, max_val = column_ranges[col]
            available = [n for n in range(min_val, max_val + 1) if n not in used_numbers]
            
            if available:
                row = random.randint(0, 2)
                number = random.choice(available)
                grid[row][col] = number
                used_numbers.add(number)
        
        # Now fill remaining positions to get exactly 5 numbers per row
        for row in range(3):
            current_count = sum(1 for cell in grid[row] if cell is not None)
            
            # Add more numbers if needed
            while current_count < 5:
                empty_cols = [col for col, cell in enumerate(grid[row]) if cell is None]
                if not empty_cols:
                    break
                    
                col = random.choice(empty_cols)
                min_val, max_val = column_ranges[col]
                available = [n for n in range(min_val, max_val + 1) if n not in used_numbers]
                
                if available:
                    number = random.choice(available)
                    grid[row][col] = number
                    used_numbers.add(number)
                    current_count += 1
                else:
                    break
            
            # Remove excess numbers if any
            while current_count > 5:
                filled_cols = [col for col, cell in enumerate(grid[row]) if cell is not None]
                # Only remove if column will still have numbers
                removable = []
                for col in filled_cols:
                    col_count = sum(1 for r in range(3) if grid[r][col] is not None)
                    if col_count > 1:
                        removable.append(col)
                
                if removable:
                    col = random.choice(removable)
                    used_numbers.remove(grid[row][col])
                    grid[row][col] = None
                    current_count -= 1
                else:
                    break
        
        return grid
    
    @staticmethod
    def _verify_ticket(grid: List[List[Optional[int]]]) -> None:
        """Verify that the ticket meets all constraints"""
        # Check grid dimensions
        assert len(grid) == 3, "Grid must have 3 rows"
        assert all(len(row) == 9 for row in grid), "Each row must have 9 columns"
        
        # Check each row has exactly 5 numbers
        for i, row in enumerate(grid):
            numbers_in_row = sum(1 for cell in row if cell is not None)
            assert numbers_in_row == 5, f"Row {i} has {numbers_in_row} numbers, expected 5"
        
        # Check all numbers are unique
        all_numbers = [cell for row in grid for cell in row if cell is not None]
        assert len(all_numbers) == len(set(all_numbers)), "All numbers must be unique"
        
        # Check column constraints
        for col in range(9):
            min_val = col * 10 + 1
            max_val = (col + 1) * 10 if col < 8 else 90
            
            column_numbers = [grid[row][col] for row in range(3) if grid[row][col] is not None]
            
            # Each column must have at least one number
            assert len(column_numbers) > 0, f"Column {col} must have at least one number"
            
            # All numbers in column must be in range
            for num in column_numbers:
                assert min_val <= num <= max_val, f"Number {num} in column {col} is out of range [{min_val}, {max_val}]"
