import type { Project } from '../models/Project';
import { Process } from '../models/Process';

export function setupAddFormHTML(
  element: HTMLFormElement,
  project: Project,
  selectedType: 'task' | 'milestone' | 'process' = 'task'
) {
  element.innerHTML = `
    <!-- Tipo -->
    <div class="mb-3">
      <label for="addItemType" class="form-label">Tipo de ítem</label>
      <select class="form-select" id="addItemType" required>
        <option value="task" ${
          selectedType === 'task' ? 'selected' : ''
        }>Tarea</option>
        <option value="milestone" ${
          selectedType === 'milestone' ? 'selected' : ''
        }>Hito</option>
        <option value="process" ${
          selectedType === 'process' ? 'selected' : ''
        }>Proceso</option>
      </select>
    </div>

    <!-- Nombre -->
    <div class="mb-3">
      <label for="addItemName" class="form-label">Nombre</label>
      <input type="text" class="form-control" id="addItemName" required />
    </div>

    <!-- Detalle -->
    <div class="mb-3">
      <label for="addItemDetail" class="form-label">Detalle</label>
      <textarea class="form-control" id="addItemDetail" rows="2"></textarea>
    </div>

    <!-- Campos específicos del tipo -->
    <div id="addItemSpecificFields"></div>

    <!-- Predecesores -->
    <div class="mb-3">
      <label for="addItemPredecessors" class="form-label">Predecesores</label>
      <select multiple class="form-select" id="addItemPredecessors">
        ${generatePredecessorOptions(project)}
      </select>
      <div class="form-text">Puedes mantener Ctrl (o Cmd) presionado para seleccionar varios.</div>
    </div>

    <!-- Contenedor / Proceso padre -->
    <div class="mb-3">
      <label for="addItemParentProcess" class="form-label">Pertenece a proceso</label>
      <select class="form-select" id="addItemParentProcess">
        <option value="${
          project.rootProcess.id
        }" selected>(raíz del proyecto)</option>
        ${generateProcessOptions(project)}
      </select>
    </div>

    <button class="btn btn-sm btn-success mt-2">Guardar</button>
  `;

  const itemType = document.getElementById('addItemType') as HTMLSelectElement;
  const specificFields = document.getElementById(
    'addItemSpecificFields'
  ) as HTMLDivElement;

  const updateSpecificFields = () => {
    specificFields.innerHTML = ''; // limpiar campos dinámicos

    switch (itemType.value as 'task' | 'milestone' | 'process') {
      case 'task':
        specificFields.innerHTML = `
          <!-- Duración -->
          <div class="mb-3">
            <label for="addItemDuration" class="form-label">Duración (días)</label>
            <input type="number" class="form-control" id="addItemDuration" required />
          </div>
          <!-- Fecha de inicio real -->
          <div class="mb-3">
            <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
            <input type="date" class="form-control" id="addActualStartDate" />
          </div>
        `;
        break;

      case 'milestone':
        specificFields.innerHTML = `
          <!-- Fecha de inicio real -->
          <div class="mb-3">
            <label for="addActualStartDate" class="form-label">Inicio real (opcional)</label>
            <input type="date" class="form-control" id="addActualStartDate" />
          </div>
        `;
        break;

      case 'process':
        // Nada adicional
        break;
    }
  };

  itemType.addEventListener('change', updateSpecificFields);
  updateSpecificFields(); // inicializa campos específicos
}

/** Genera opciones para seleccionar el proceso padre */
function generateProcessOptions(project: Project): string {
  const options: string[] = [];

  project.traverse((item) => {
    if (item instanceof Process) {
      options.push(
        `<option value="${item.id}">${item.name} (#${item.id})</option>`
      );
    }
  });

  return options.join('\n');
}

/** Genera opciones para predecesores válidos */
function generatePredecessorOptions(project: Project): string {
  const options: string[] = [];

  project.getAllItems().forEach((item) => {
    const isSpecial =
      item.id === project.rootProcess.id ||
      item.id === project.getStartMilestone().id ||
      item.id === project.getEndMilestone().id;

    if (!isSpecial) {
      options.push(
        `<option value="${item.id}">${item.name} (#${item.id})</option>`
      );
    }
  });

  return options.join('\n');
}
