import type { Project } from '../models/Project';
import { setupAddFormHTML } from './setupAddItemForm';

export interface FormItemValues {
  title: string;
  id: number;
  type: 'task' | 'milestone' | 'process';
  name: string;
  detail?: string;
  duration?: number;
  actualStartDate?: Date;
  processId: number;
  predecessorIds: number[];
  cost?: number;
  useManualCost?: boolean; // Nuevo campo para procesos
}

export function getFormItemValues(): FormItemValues {
  try {
    const form = document.getElementById('addForm') as HTMLFormElement;
    const idAttr = form.getAttribute('data-id');
    const id = idAttr ? Number(idAttr) : -1;

    const type = (document.getElementById('addItemType') as HTMLSelectElement)
      .value as 'task' | 'milestone' | 'process';
    const name = (document.getElementById('addItemName') as HTMLInputElement)
      .value;
    const detail = (
      document.getElementById('addItemDetail') as HTMLTextAreaElement
    ).value;

    const durationInput = document.getElementById(
      'addItemDuration'
    ) as HTMLInputElement | null;
    const duration = durationInput ? Number(durationInput.value) : undefined;

    const actualStartInput = document.getElementById(
      'addActualStartDate'
    ) as HTMLInputElement | null;
    const actualStartDate = actualStartInput?.value
      ? new Date(actualStartInput.value)
      : undefined;

    const parentProcessIdRaw = (
      document.getElementById('addItemParentProcess') as HTMLSelectElement
    ).value;
    const processId = Number(parentProcessIdRaw);

    const predSelect = document.getElementById(
      'addItemPredecessors'
    ) as HTMLSelectElement;
    const predecessorIds = Array.from(predSelect.selectedOptions).map((opt) =>
      Number(opt.value)
    );

    // Agregar campo cost
    const costInput = document.getElementById('addItemCost') as HTMLInputElement | null;
    const cost = costInput ? Number(costInput.value) || 0 : 0;

    // Agregar campo useManualCost para procesos
    const useManualCostInput = document.getElementById('addItemUseManualCost') as HTMLInputElement | null;
    const useManualCost = useManualCostInput ? useManualCostInput.checked : false;

    return {
      title: 'Nuevo Item',
      id,
      type,
      name,
      detail,
      duration,
      actualStartDate,
      processId,
      predecessorIds,
      cost,
      useManualCost, // Incluir useManualCost en el retorno
    };
  } catch (error) {
    console.error('Error getting form item values:', error);
    throw new Error('Error al obtener los valores del formulario');
  }
}

export function clearAddItemForm(project: Project): void {
  const form = document.getElementById('addForm') as HTMLFormElement;
  form.removeAttribute('data-id');

  (document.getElementById('addItemType') as HTMLSelectElement).value = 'task';
  (document.getElementById('addItemName') as HTMLInputElement).value = '';
  (document.getElementById('addItemDetail') as HTMLTextAreaElement).value = '';

  // Esto fuerza la actualización del formulario
  setupAddFormHTML(
    document.getElementById('addForm') as HTMLFormElement,
    project,
    'task'
  );
}

export function populateAddItemForm(
  values: FormItemValues,
  project: Project
): void {
  // Guardamos el ID en un atributo data-id para poder recuperarlo luego
  const form = document.getElementById('addForm') as HTMLFormElement;
  form.setAttribute('data-id', values.id.toString());

  console.log(values);
  // Establece el tipo y fuerza recarga de campos
  (document.getElementById('addItemType') as HTMLSelectElement).value =
    values.type;
  console.log(
    'type en el form',
    (document.getElementById('addItemType') as HTMLSelectElement).value
  );

  setupAddFormHTML(
    document.getElementById('addForm') as HTMLFormElement,
    project,
    values.type
  );

  // Esperamos que el DOM se actualice
  setTimeout(() => {
    (document.getElementById('addItemName') as HTMLInputElement).value =
      values.name;
    (document.getElementById('addItemDetail') as HTMLTextAreaElement).value =
      values.detail || '';

    (
      document.getElementById('addItemParentProcess') as HTMLSelectElement
    ).value = values.processId?.toString() || 'root';

    // ✅ Establecer predecesores seleccionados
    const predSelect = document.getElementById(
      'addItemPredecessors'
    ) as HTMLSelectElement;
    if (values.predecessorIds?.length) {
      for (const opt of predSelect.options) {
        opt.selected = values.predecessorIds.includes(Number(opt.value));
      }
    }

    if (values.type === 'task') {
      if (values.duration !== undefined) {
        (document.getElementById('addItemDuration') as HTMLInputElement).value =
          values.duration.toString();
      }
    }

    if (values.type !== 'process' && values.actualStartDate) {
      (
        document.getElementById('addActualStartDate') as HTMLInputElement
      ).value = values.actualStartDate.toISOString().split('T')[0];
    }
  }, 100);
}
