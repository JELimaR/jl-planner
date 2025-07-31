import {
  clearAddItemForm,
  getFormItemValues,
  populateAddItemForm,
} from './controllers/addItemValues';
import { itemToFormValues } from './controllers/dataHelpers';
import ProjectController from './controllers/ProjectController';
import { setupAddFormHTML } from './controllers/setupAddItemForm';
import type { Item } from './models/Item';
import { setProjectItemsColors } from './views/colors';
import { criticalPathRenderer } from './views/criticalPathRenderer';
import type { Scale } from './views/ganttHelpers';
import { ganttRenderer } from './views/ganttRenderer';
import { renderTaskTable } from './views/tableRenderer';
import { Modal } from 'bootstrap';

// ========================================
// 1. Controlador del proyecto (singleton)
// ========================================
const controller = ProjectController.getInstance();

// ========================================
// 2. Escala de Gantt
// ========================================
let currentScale: Scale = 'week';

// ========================================
// 3. Intentar cargar un proyecto por defecto desde /project.json
// ========================================
fetch('/project.json')
  .then((res) => {
    if (!res.ok) throw new Error('No se pudo cargar project.json');
    return res.json();
  })
  .then((json) => {
    controller.loadProjectFromFile(json);
    renderAll();
  })
  .catch((err) => {
    console.warn('No se pudo cargar project.json:', err);
    controller.createNewProject(new Date()); // fallback
    controller.chargeExampleProject();

    renderAll();
  });

// ========================================
// 4. Preparar el formulario (vacío de inicio)
// ========================================
const ADD_FORM_HTML = document.getElementById('addForm')! as HTMLFormElement;
setupAddFormHTML(ADD_FORM_HTML, controller.getProject());

// ========================================
// 5. Configurar botones fijos de la UI
// ========================================
setupStaticButtonEvents();

// ========================================
// 6. Función principal de renderizado
// ========================================
function renderAll() {
  setProjectItemsColors(controller.getProject());
  updateProjectDatesDisplay();

  updateTitleFields();

  // Tabla de tareas
  const tbody = document.getElementById('tbody')!;
  renderTaskTable(controller.getProject(), tbody);

  // Diagrama de Gantt
  setupScaleSelector();
  ganttRenderer(controller.getProject(), currentScale);

  // Caminos críticos
  const critical = document.getElementById('critical-paths')!;
  criticalPathRenderer(critical, controller.getProject());

  // Botones dinámicos por ítem
  setupDynamicItemButtons();
}

// ========================================
// 7. Botones estáticos de la interfaz
// ========================================
function setupStaticButtonEvents() {
  const addModalElement = document.getElementById('addModal')!;
  const addModal = Modal.getOrCreateInstance(addModalElement);
  const modalTitle = addModalElement.querySelector('.modal-title');

  const deleteModalElement = document.getElementById('deleteModal')!;
  const deleteModal = Modal.getOrCreateInstance(deleteModalElement);

  // ➕ Botón "Agregar nuevo ítem"
  document.getElementById('add-item-button')?.addEventListener('click', () => {
    clearAddItemForm(controller.getProject());
    if (modalTitle) modalTitle.textContent = 'Agregar nuevo ítem';
    addModal.show();
  });

  // ✅ Guardar ítem (formulario)
  document.getElementById('addForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = getFormItemValues();

    try {
      if (values.id !== -1) {
        controller.editItem(values.id, values);
      } else {
        controller.addNewItem(values);
      }
    } catch (err) {
      console.error('Error al guardar ítem:', err);
    }

    (document.activeElement as HTMLElement)?.blur();
    addModal.hide();
    renderAll();
  });

  // 🗑️ Confirmar eliminar
  document.getElementById('delete-confirm')?.addEventListener('click', () => {
    const id = getFormItemValues().id;
    if (id !== undefined) {
      try {
        controller.deleteItem(id);
      } catch (err) {
        console.error('Error al eliminar ítem:', err);
      }

      (document.activeElement as HTMLElement)?.blur();
      deleteModal.hide();
      renderAll();
    }
  });

  // ❌ Botón cerrar (modal agregar)
  addModalElement.querySelector('.btn-close')?.addEventListener('click', () => {
    (document.activeElement as HTMLElement)?.blur();
    addModal.hide();
  });

  // ❌ Botón cerrar (modal eliminar)
  deleteModalElement
    .querySelector('.btn-close')
    ?.addEventListener('click', () => {
      (document.activeElement as HTMLElement)?.blur();
      deleteModal.hide();
    });

  // 🔙 Botón cancelar (modal eliminar)
  document.getElementById('delete-cancel')?.addEventListener('click', () => {
    (document.activeElement as HTMLElement)?.blur();
    deleteModal.hide();
  });

  // 💾 Guardar proyecto como JSON
  document
    .getElementById('save-project-button')
    ?.addEventListener('click', () => {
      controller.downloadProjectAsJSON();
    });

  // 📂 Cargar proyecto desde archivo
  document
    .getElementById('load-project-button')
    ?.addEventListener('click', () => {
      document.getElementById('load-project-file')?.click();
    });

  document
    .getElementById('load-project-file')
    ?.addEventListener('change', async (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      await controller.loadProjectFromFile(file);
      renderAll();
    });

  // 🕒 Cambiar fecha de inicio del proyecto
  document
    .getElementById('change-start-date-button')
    ?.addEventListener('click', () => {
      const input = document.getElementById(
        'new-start-date-input'
      ) as HTMLInputElement;
      if (!input?.value) return;

      const newDate = new Date(input.value);
      controller.changeStartDate(newDate);
      controller.getProject().calculateItemDates();
      renderAll();
    });

  // 🆕 Crear nuevo proyecto vacío
  document
    .getElementById('new-project-button')
    ?.addEventListener('click', () => {
      if (
        !confirm(
          '¿Estás seguro de que deseas crear un nuevo proyecto? Se perderán los datos actuales.'
        )
      ) {
        return;
      }

      controller.createNewProject(new Date());
      renderAll();
    });

  // 🔄 Resetear fechas reales de inicio
  document
    .getElementById('reset-actual-start-dates')
    ?.addEventListener('click', () => {
      controller.resetActualStartDates();
      renderAll();
    });

  // 🖨️ Imprimir informe (modo print_mode)
  document
    .getElementById('export-pdf-button')
    ?.addEventListener('click', () => {
      document.body.classList.add('print_mode');

      const dateEl = document.getElementById('print-date');
      if (dateEl) {
        const today = new Date().toISOString().split('T')[0];
        dateEl.textContent = `Fecha: ${today}`;
      }

      setTimeout(() => {
        window.print();
        document.body.classList.remove('print_mode');
      }, 500); // Delay para asegurar render antes de imprimir
    });
}

// ========================================
// 8. Botones dinámicos (por ítem)
// ========================================
function setupDynamicItemButtons() {
  const addModalElement = document.getElementById('addModal')!;
  const addModal = Modal.getOrCreateInstance(addModalElement);
  const modalTitle = addModalElement.querySelector('.modal-title');

  const deleteModalElement = document.getElementById('deleteModal')!;
  const deleteModal = Modal.getOrCreateInstance(deleteModalElement);
  const deleteModalTitle = deleteModalElement.querySelector('.modal-title');

  controller
    .getProject()
    .getAllItems()
    .forEach((item: Item) => {
      // 🖊️ Editar
      const editBtn = document.getElementById(`edit-item-button-${item.id}`);
      if (editBtn) {
        editBtn.onclick = () => {
          populateAddItemForm(itemToFormValues(item), controller.getProject());
          if (modalTitle)
            modalTitle.textContent = `Editar ítem (#${item.id} - ${item.name})`;
          addModal.show();
        };
      }

      // 🗑️ Eliminar
      const deleteBtn = document.getElementById(
        `delete-item-button-${item.id}`
      );
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          populateAddItemForm(itemToFormValues(item), controller.getProject());
          if (deleteModalTitle)
            deleteModalTitle.textContent = `Eliminar ítem (#${item.id} - ${item.name})`;
          deleteModal.show();
        };
      }
    });
}

// ========================================
// 9. Mostrar fechas de inicio/fin del proyecto
// ========================================
function updateProjectDatesDisplay() {
  const startDateEl = document.getElementById('start-date-value')!;
  startDateEl.textContent = controller
    .getProject()
    .getProjectStartDate()
    .toISOString()
    .split('T')[0];

  const endDateEl = document.getElementById('end-date-value')!;
  endDateEl.textContent = controller
    .getProject()
    .getProjectEndDate()
    .toISOString()
    .split('T')[0];
}

// ========================================
// 10. Selector de escala del diagrama Gantt
// ========================================
function setupScaleSelector(): void {
  const scaleSelector = document.getElementById(
    'scale-selector'
  ) as HTMLSelectElement;

  if (scaleSelector) {
    scaleSelector.value = currentScale;

    scaleSelector.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      currentScale = target.value as Scale;
      ganttRenderer(controller.getProject(), currentScale);
    });
  }
}

function updateTitleFields() {
  const project = controller.getProject();
  const title = project.getTitle();
  const subtitle = project.getSubtitle();

  // Mostrar en pantalla
  const titleEl = document.getElementById('project-title');
  const subtitleEl = document.getElementById('project-subtitle');
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;

  // Inputs
  const titleInput = document.getElementById(
    'project-title-input'
  ) as HTMLInputElement;
  const subtitleInput = document.getElementById(
    'project-subtitle-input'
  ) as HTMLInputElement;
  if (titleInput) titleInput.value = title;
  if (subtitleInput) subtitleInput.value = subtitle;
}

// Título editable del proyecto
const editTitleModalEl = document.getElementById('editTitleModal')!;
const editTitleModal = Modal.getOrCreateInstance(editTitleModalEl);

document.getElementById('edit-title-button')?.addEventListener('click', () => {
  const project = controller.getProject();
  (document.getElementById('project-title-input') as HTMLInputElement).value =
    project.getTitle();
  (
    document.getElementById('project-subtitle-input') as HTMLInputElement
  ).value = project.getSubtitle();
  editTitleModal.show();
});

// Botón "Guardar título"
document.getElementById('title-save-button')?.addEventListener('click', () => {
  const titleInput = document.getElementById(
    'project-title-input'
  ) as HTMLInputElement;
  const subtitleInput = document.getElementById(
    'project-subtitle-input'
  ) as HTMLInputElement;

  controller.getProject().setTitle(titleInput.value);
  controller.getProject().setSubtitle(subtitleInput.value);
  editTitleModal.hide();
  updateTitleFields();
});

// Cerrar modal con cualquier botón .btn-close
document
  .getElementById('title-cancel-button')!
  .addEventListener('click', () => editTitleModal.hide());
