def number_to_words(number: int) -> str:
    """Convert a number (1-90) to its spoken form"""
    
    if not 1 <= number <= 90:
        return str(number)
    
    # Basic number words
    ones = [
        "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
        "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
        "seventeen", "eighteen", "nineteen"
    ]
    
    tens = [
        "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ]
    
    if number < 20:
        return ones[number]
    elif number < 100:
        tens_digit = number // 10
        ones_digit = number % 10
        if ones_digit == 0:
            return tens[tens_digit]
        else:
            return f"{tens[tens_digit]}-{ones[ones_digit]}"
    
    return str(number)  # fallback
