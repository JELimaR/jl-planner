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
function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (value: number): string => {
    const hex = Math.round(value).toString(16).padStart(2, '0');
    return hex.toUpperCase();
  };

  const alpha = Math.round(a * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
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
