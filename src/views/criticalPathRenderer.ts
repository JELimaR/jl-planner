import type { Project } from '../models/Project';
import { formatDateToDisplay } from '../models/dateFunc';

export function criticalPathRenderer(container: HTMLElement, project: Project) {
  const criticalPaths = project.getCriticalPaths();
  // Limpiar contenido anterior
  container.innerHTML = ''; // Limpiar contenido previo

  const wrapper = document.createElement('div');
  wrapper.className = 'container my-4';

  const title = document.createElement('h3');
  title.textContent = 'Caminos Críticos Detectados';
  wrapper.appendChild(title);

  if (criticalPaths.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'No se detectaron caminos críticos.';
    wrapper.appendChild(msg);
    container.appendChild(wrapper);
    return;
  }

  criticalPaths.forEach((cp, index) => {
    const subtitle = document.createElement('h5');
    subtitle.className = 'mt-4';
    subtitle.textContent = `Camino Crítico #${index + 1} — Retraso total: ${
      cp.totalDelayDays
    } días`;
    wrapper.appendChild(subtitle);

    const table = document.createElement('table');
    table.className = 'table table-sm table-bordered';

    // Encabezados
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width: 4%">#</th>
        <th style="width: 8%; font-size: 0.75rem;">ID</th>
        <th style="width: 38%">Nombre</th>
        <th style="width: 20%">Tipo</th>
        <th style="width: 20%">Retraso (días)</th>
      </tr>
    `;
    table.appendChild(thead);

    // Cuerpo
    const tbody = document.createElement('tbody');

    cp.path.forEach((item, i) => {
      const tr = document.createElement('tr');

      const delay = item.getDelayInDays();

      tr.innerHTML = `
        <td>${i + 1}</td>
        <td style="font-size: 0.75rem;">${item.id}</td>
        <td>${item.name}</td>
        <td style="font-size: 0.75rem;">${formatDateToDisplay(item.getStartDate()!)}</td>
        <td>${delay}</td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
  });

  // Retraso global del proyecto
  const summary = document.createElement('div');
  summary.className = 'mt-3';
  /*
  summary.innerHTML = `
    <strong>Retraso total del proyecto:</strong> ${project.getTotalProjectDelayInDays()} días
  `;*/
  wrapper.appendChild(summary);

  container.appendChild(wrapper);
}
