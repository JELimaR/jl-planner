type TDateString = string & {
    __brand: 'DateString'; // Type branding to ensure valid format
};

// Type guard to validate if a string is a valid TDateString
function isValidDateString(dateString: string): dateString is TDateString {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (!match) return false;

    const [_, day, month, year] = match.map(Number);

    // Validate date ranges
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // Create date to validate real date existence
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year;
}

// Function to safely create a TDateString
function createDateString(dateString: string): TDateString {
    if (!isValidDateString(dateString)) {
        throw new Error('Invalid date string format or date values');
    }
    return dateString as TDateString;
}
/*********************************************************************************************************************************************** */
/**
 * Convierte una cadena de fecha en formato 'dd-mm-yyyy' a un objeto Date.
 * @param dateString - La cadena de fecha a convertir.
 * @returns El objeto Date correspondiente.
 * @throws Error si la cadena de fecha no es válida.
 */
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

/**
 * Convierte un objeto Date a una cadena de fecha en formato 'dd-mm-yyyy'.
 * @param date - El objeto Date a convertir.
 * @returns La cadena de fecha correspondiente.
 */

export function formatDateToDisplay(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
}
