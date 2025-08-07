import { defineStore } from 'pinia';
import { useProjectStore } from './project';
import { useUIStore } from './ui';
import type { IItemData } from '../src/models/Item';
import { ITaskData } from '../src/models/Task';
import { IProcessData } from '../src/models/Process';
import { IMilestoneData } from '../src/models/Milestone';
import { TDateString } from '../src/models/dateFunc';

export interface FormItemValues {
  title: string;
  id: number;
  type: 'task' | 'milestone' | 'process';
  name: string;
  detail?: string;
  duration?: number;
  actualStartDate?: TDateString;
  parentId: number;
  predecessorIds: number[];
  cost?: number;
  useManualCost?: boolean; // Nuevo campo para procesos
}

// Define el estado inicial del formulario
const initialFormState: FormItemValues = {
  title: 'Nuevo Item',
  type: 'task',
  id: -1,
  name: '',
  duration: 1,
  predecessorIds: [],
  parentId: 1001,
  cost: 0,
  useManualCost: false, // Agregar useManualCost con valor por defecto
};

export const useFormItemStore = defineStore('formItem', {
  state: () => ({
    // El objeto del formulario que se enlazará con v-model
    form: { ...initialFormState },
  }),

  // Agrega una nueva propiedad computada al store para la validación
  getters: {
    isFormValid(state) {
      const isNameValid = state.form.name.trim() !== '';
      let isValid = isNameValid;

      if (state.form.type === 'task') {
        isValid = isValid && state.form.duration !== null && state.form.duration! > 0;
      }

      if (state.form.type === 'process' && state.form.useManualCost) {
        isValid = isValid && state.form.cost !== null && state.form.cost! >= 0;
      }
      
      // añadir más validaciones
      
      return isValid;
    },
  },

  actions: {
    /**
     * Resetea el formulario a sus valores iniciales.
     */
    resetForm() {
      try {
        this.form = { ...initialFormState };
        // Opcional: inicializar el padre del proceso al root por defecto
        const projectStore = useProjectStore();
        this.form.processId = projectStore.controller.getProject().getRoot().id;
      } catch (error) {
        console.error('Error resetting form:', error);
      }
    },

    /**
     * Carga los datos de un item para el modo de edición.
     * @param item El item a editar
     */
    loadFormForEdit(item: IItemData) {
      try {
        this.form = itemDataToFormValues(item)
      } catch (error) {
        console.error('Error loading form for edit:', error);
        throw new Error('Error al cargar los datos del item para edición');
      }
    },

    /**
     * Maneja el envío del formulario.
     */
    submitForm() {
      const projectStore = useProjectStore();
      const uiStore = useUIStore();
      
      try {
        // La validación se realiza aquí. Usamos un getter para la validez.
      if (!this.isFormValid) {
        // En un entorno real, podrías lanzar un error o mostrar una notificación.
        console.error('El formulario no es válido.');
        return;
      }
      
        if (this.form.id !== -1) {
          // Lógica para editar un item existente
          projectStore.editItem(formValuesToItemData(this.form.id, this.form));
        } else {
          // Lógica para agregar un nuevo item
          projectStore.addNewItem(formValuesToItemData(this.form.id, this.form));
        }
        // Llamar a resetForm para limpiar el formulario después del envío
        this.resetForm();
        
        // Cerrar el modal después de guardar exitosamente
        uiStore.closeAddModal();
      } catch (error) {
        console.error('Error al guardar el item:', error);
        throw error; // Re-lanzar para que el componente pueda manejarlo
      }
    },
  },
});

export function itemDataToFormValues(item: IItemData): FormItemValues {
  const parentId = item.parentId;
  if (!parentId) {
    throw new Error(`Item ${item.name} no tiene proceso padre`);
  }
  const common = {
    title: `Editar: (#${item.id} - ${item.name})`,
    id: item.id,
    type: item.type,
    name: item.name,
    detail: item.detail,
    parentId: parentId,
    predecessorIds: item.predecessorIds,
    cost: item.cost,
  };

  if ('duration' in item) {
    return {
      ...common,
      duration: (item as ITaskData).duration,
      actualStartDate: (item as ITaskData).actualStartDate,
    };
  }

  if (item.type === 'milestone') {
    return {
      ...common,
      actualStartDate: (item as IMilestoneData).actualStartDate,
    };
  }

  // Proceso
  if (item.type === 'process') {
    return {
      ...common,
      useManualCost: (item as IProcessData).useManualCost,
    };
  }

  return common;
}

function formValuesToItemData(id: number, formValues: FormItemValues): IItemData {
  switch (formValues.type) {
    case 'task':
      return {
        id: id,
        type: 'task',
        name: formValues.name,
        detail: formValues.detail,
        startDate: '' as TDateString,
        endDate: '' as TDateString,
        cost: formValues.cost || 0,
        parentId: formValues.parentId,
        predecessorIds: formValues.predecessorIds,
        duration: formValues.duration!,
        actualStartDate: formValues.actualStartDate,
        manualDuration: formValues.duration,
      } as ITaskData;

    case 'milestone':
      return {
        id: id,
        type: 'milestone',
        name: formValues.name,
        detail: formValues.detail,
        startDate: '' as TDateString,
        endDate: '' as TDateString,
        cost: formValues.cost || 0,
        parentId: formValues.parentId,
        predecessorIds: formValues.predecessorIds,
        actualStartDate: formValues.actualStartDate,
      } as IMilestoneData;

    case 'process':
      return {
        id: id,
        type: 'process',
        name: formValues.name,
        detail: formValues.detail,
        startDate: '' as TDateString,
        endDate: '' as TDateString,
        cost: formValues.cost || 0,
        parentId: formValues.parentId,
        predecessorIds: formValues.predecessorIds,
        useManualCost: formValues.useManualCost || false,
        children: [], // Processes don't have children from form input
      } as IProcessData;

    default:
      throw new Error('Unsupported item type from form values.');
  }
}