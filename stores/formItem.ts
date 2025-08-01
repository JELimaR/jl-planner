

import { defineStore } from 'pinia';
import { useProjectStore } from './project';
import type { FormItemValues } from '../src/controllers/addItemValues';
import type { Item } from '../src/models/Item';
import { Task } from '../src/models/Task';

// Define el estado inicial del formulario
const initialFormState: FormItemValues = {
  type: 'task',
  id: -1,
  name: '',
  duration: 1,
  predecessorIds: [],
  processId: 1001,
};

export const useFormItemStore = defineStore('formItem', {
  state: () => ({
    // El objeto del formulario que se enlazará con v-model
    form: { ...initialFormState },
  }),

  actions: {
    /**
     * Resetea el formulario a sus valores iniciales.
     */
    resetForm() {
      this.form = { ...initialFormState };
      // Opcional: inicializar el padre del proceso al root por defecto
      const projectStore = useProjectStore();
      if (projectStore.isInitialized) {
        this.form.parentProcessId = projectStore.controller.getProject().rootProcess.id;
      }
    },

    /**
     * Carga los datos de un item para el modo de edición.
     * @param item El item a editar
     */
    loadFormForEdit(item: Item) {
      this.form = {
        type: item.type,
        name: item.name,
        detail: item.detail,
        predecessors: item.predecessors,
        parentProcessId: item.parent?.id,
        duration: item instanceof Task ? item.duration : undefined,
        actualStartDate: item.hasActualStartDate() ? item.getStartDate() : undefined
      };
      // Aquí puedes agregar más lógica específica si la necesitas
    },

    /**
     * Maneja el envío del formulario.
     */
    submitForm() {
      const projectStore = useProjectStore();
      if (projectStore.itemToEdit) {
        // Lógica para editar un item
        projectStore.editItem(this.form);
      } else {
        // Lógica para agregar un nuevo item
        projectStore.addNewItem(this.form);
      }
      // Llamar a resetForm para limpiar el formulario después del envío
      this.resetForm();
    },
  },
});