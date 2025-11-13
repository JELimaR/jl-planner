import type { Item } from '../models/Item';
import type { Process } from '../models/Process';
import { Project } from '../models/Project';

export const COLOR_PALETTE: string[] = [
  '#5ade86',
  '#fc863c',
  '#7e747c',
  //'#b9505b',
  '#ffb24e',
  '#45b899',
  '#fb7033',
];

export const CRITICAL_COLOR = '#9f1118';

/*************************************************************************************/
function ligthenColor(color: string, alpha: number): string {
  const parsedHex = color.replace('#', '');
  const r = parseInt(parsedHex.slice(0, 2), 16);
  const g = parseInt(parsedHex.slice(2, 4), 16);
  const b = parseInt(parsedHex.slice(4, 6), 16);
  return rgbaToHex(r, g, b, alpha);
}

/**
 * 
 */
function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (value: number): string => {
    const hex = Math.round(value).toString(16).padStart(2, '0');
    return hex.toUpperCase();
  };

  const alpha = Math.round(a * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

/**
 * Convierte un color hexadecimal (de 3, 6 u 8 dígitos, con o sin '#') a un array RGBA.
 * El componente alfa (A) se devuelve como un valor de coma flotante entre 0 y 1.
 * @param hex La cadena de color hexadecimal (ej: '#03F', '0033FF', '#0033FFCC').
 * @returns Un array [R, G, B, A] donde R, G, B son 0-255 y A es 0-1.
 */
export function hexToRgba(hex: string): [number, number, number, number] {
    // 1. Manejo del caso 'transparent' y valores nulos/vacíos
    if (!hex || hex.toLowerCase() === 'transparent') {
        // Blanco completamente transparente o tu valor por defecto preferido
        return [255, 255, 255, 0]; 
    }

    // 2. Limpieza y estandarización de la cadena hex
    let cleanHex = hex.replace(/^#/, '');

    // 3. Manejo de formato corto (3 o 4 dígitos)
    if (cleanHex.length === 3 || cleanHex.length === 4) {
        // Duplicar cada carácter: 'abc' -> 'aabbcc'
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }

    // 4. Validación de longitud
    if (cleanHex.length !== 6 && cleanHex.length !== 8) {
        // Color inválido: devuelve negro transparente
        console.error(`Formato hexadecimal inválido: ${hex}`);
        return [0, 0, 0, 0];
    }

    // 5. Extracción de componentes
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    // 6. Extracción de alfa (si existe)
    let a = 1; // Valor por defecto para hex de 6 dígitos

    if (cleanHex.length === 8) {
        const alphaHex = cleanHex.substring(6, 8);
        const alphaInt = parseInt(alphaHex, 16); // 0 - 255
        a = alphaInt / 255; // 0 - 1
    }

    // 7. Devolver el resultado
    // Se añade validación para asegurar que los valores sean números válidos
    const red = isNaN(r) ? 0 : r;
    const green = isNaN(g) ? 0 : g;
    const blue = isNaN(b) ? 0 : b;
    const alpha = isNaN(a) ? 1 : a;

    return [red, green, blue, alpha];
}

/**
 * Calcula el brillo de un color RGB
 */
export function calculateBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000
}

export function setProjectItemsColors(project: Project) {
  const traverseFunc = (item: Item, depth: number, parentProcess: Process) => {
    let bgColor = '';
    if (
      item.id == project.getEndMilestone().id ||
      item.id == project.getStartMilestone().id
    ) {
      bgColor = '#E1E1E1';
    } else if (parentProcess.id == project.getRoot().id) {
      bgColor = COLOR_PALETTE[item.id % COLOR_PALETTE.length];
    } else {
      bgColor = parentProcess._color!;
      bgColor = ligthenColor(bgColor, 1 - 0.2 * depth);
    }
    item._color = bgColor;
  };
  project.traverse(traverseFunc);
}
