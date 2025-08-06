export function displayStringToDate(dateString: string): Date {
    // Validate date string format (dd-mm-yyyy)
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) {
        throw new Error('Invalid date string format. Expected format: dd-mm-yyyy');
    }

    const [_, day, month, year] = match.map(Number);

    // Validate date values
    if (month < 1 || month > 12) {
        throw new Error('Invalid month value');
    }
    if (day < 1 || day > 31) {
        throw new Error('Invalid day value');
    }
    if (year < 1900 || year > 2100) {
        throw new Error('Invalid year value');
    }

    // Create date using UTC to avoid timezone issues
    return new Date(Date.UTC(year, month - 1, day));
}


export function formatDateToDisplay(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
}
