import { defineStore } from 'pinia';
import { useProjectStore } from './project';
import { useUIStore } from './ui';
import type { FormItemValues } from '../src/controllers/addItemValues';
import type { Item } from '../src/models/Item';
import { Task } from '../src/models/Task';
import { Process } from '../src/models/Process';
import { itemToFormValues } from '../src/controllers/dataHelpers';

// Define el estado inicial del formulario
const initialFormState: FormItemValues = {
  type: 'task',
  id: -1,
  name: '',
  duration: 1,
  predecessorIds: [],
  processId: 1001,
  cost: 0,
  useManualCost: false, // Agregar useManualCost con valor por defecto
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
    loadFormForEdit(item: Item) {
      try {
        this.form = itemToFormValues(item)
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
        if (this.form.id !== -1) {
          // Lógica para editar un item existente
          if (!!this.form.actualStartDate)
            this.form.actualStartDate = new Date(this.form.actualStartDate)
          projectStore.editItem(this.form);
        } else {
          // Lógica para agregar un nuevo item
          projectStore.addNewItem(this.form);
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