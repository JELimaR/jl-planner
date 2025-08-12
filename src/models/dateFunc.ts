export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Un tipo de dato 'branded' que representa una fecha en formato 'dd-mm-yyyy'.
 * Esto ayuda a TypeScript a diferenciar entre un string normal y uno que
 * ya ha sido validado como una fecha.
 */
export type TDateString = string & { __brand: 'DateString' };

// --- Funciones de Validación y Creación ---

/**
 * Valida si un string cumple con el formato 'dd-mm-yyyy' y si representa
 * una fecha válida (ej. no permite el 30 de febrero).
 * @param dateString - El string a validar.
 * @returns 'true' si es una fecha válida, 'false' en caso contrario.
 */
export function isValidDateString(dateString: string): dateString is TDateString {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateRegex.exec(dateString);

    if (!match) return false;

    const [_, day, month, year] = match.map(Number);
    
    // El constructor de Date se encarga de la validación compleja (ej. bisiestos)
    // Se usa month-1 porque JavaScript los meses son 0-11
    const date = new Date(year, month - 1, day);

    // Comprueba que la fecha creada coincide con los valores originales
    // Esto previene fechas como "32-01-2023", que Date convertiría a "01-02-2023"
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

/**
 * Crea una TDateString de forma segura. Lanza un error si el string no es válido.
 * @param dateString - El string de fecha a convertir.
 * @returns La fecha como tipo TDateString.
 */
export function createDateString(dateString: string): TDateString {
    if (!isValidDateString(dateString)) {
        throw new Error('Formato de fecha inválido. Esperado: dd-mm-yyyy');
    }
    return dateString;
}

// --- Funciones de Conversión ---

/**
 * Convierte un TDateString a un objeto Date.
 * @param dateString - La fecha en formato 'dd-mm-yyyy'.
 * @returns Un objeto Date.
 */
export function displayStringToDate(dateString: TDateString): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Convierte un objeto Date a una cadena de fecha en formato 'dd-mm-yyyy'.
 * @param date - El objeto Date a convertir.
 * @returns La cadena de fecha correspondiente como un TDateString.
 */
export function formatDateToDisplay(date: Date | undefined): TDateString | undefined {
    if (!date) return undefined
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Al formatear desde un objeto Date, sabemos que el resultado siempre
    // será una fecha válida, por lo que la aserción de tipo es segura.
    return `${day}-${month}-${year}` as TDateString;
}