import { populateAddItemForm, getFormItemValues, clearAddItemForm } from '../src/controllers/addItemValues';
import { itemToFormValues } from '../src/controllers/dataHelpers';
import ProjectController from '../src/controllers/ProjectController';
import { setupAddFormHTML } from '../src/controllers/setupAddItemForm';
import { Item } from '../src/models/Item';
import { Project } from '../src/models/Project';
import { setProjectItemsColors } from '../src/views/colors';
import { criticalPathRenderer } from '../src/views/criticalPathRenderer';
import { Scale } from '../src/views/ganttHelpers';
import { ganttRenderer } from '../src/views/ganttRenderer';
import { renderTaskTable } from '../src/views/tableRenderer';


export const useProjectController = () => {
  const controller = ProjectController.getInstance('ik')
  
  const initializeProject = async () => {
    try {
      const response = await fetch('/template00.jlprj')
      if (!response.ok) throw new Error('No se pudo cargar template00.jlprj')
      const jlprj = await response.json()
      controller.loadProjectFromFile(jlprj)
    } catch (err) {
      console.warn('No se pudo cargar template00.jlprj:', err)
      controller.createNewProject('ik', new Date())
      controller.chargeExampleProject()
    }
  }
  
  const renderTable = () => {
    const tableContainer = document.getElementById('tbody')
    if (tableContainer) {
      tableContainer.innerHTML = ''
      renderTaskTable(controller.getProject(), tableContainer)
      setupDynamicItemButtons()
    }
  }
  
  const renderGantt = (scale: Scale = 'week') => {
    const ganttContainer = document.getElementById('gantt_here')
    if (ganttContainer) {
      ganttContainer.innerHTML = ''
      setProjectItemsColors(controller.getProject())
      ganttRenderer(controller.getProject(), scale)
    }
  }
  
  const renderCriticalPaths = () => {
    const criticalPathsContainer = document.getElementById('critical-paths')
    if (criticalPathsContainer) {
      criticalPathsContainer.innerHTML = ''
      criticalPathRenderer(criticalPathsContainer, controller.getProject())
    }
  }
  
  const setupAddForm = () => {
    const addForm = document.getElementById('addForm') as HTMLFormElement
    if (addForm) {
      addForm.innerHTML = ''
      setupAddFormHTML(addForm, controller.getProject())
    }
  }
  
  const setupDynamicItemButtons = () => {
    // Edit buttons
    document.querySelectorAll('.edit-item-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const itemId = parseInt(target.getAttribute('data-item-id') || '0')
        const item = controller.getProject().getItemById(itemId)
        if (item) {
          editItem(item)
        }
      })
    })
    
    // Delete buttons
    document.querySelectorAll('.delete-item-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const itemId = parseInt(target.getAttribute('data-item-id') || '0')
        // Trigger delete modal
        const deleteEvent = new CustomEvent('openDeleteModal', { detail: { itemId } })
        window.dispatchEvent(deleteEvent)
      })
    })
    
    // Actual start date inputs
    document.querySelectorAll('.actual-start-date-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const itemId = parseInt(target.getAttribute('data-item-id') || '0')
        const item = controller.getProject().getItemById(itemId)
        if (item && target.value) {
          item.setActualStartDate(new Date(target.value))
          controller.getProject().calculateItemDates()
          // Trigger re-render
          const renderEvent = new CustomEvent('renderAll')
          window.dispatchEvent(renderEvent)
        }
      })
    })
  }
  
  const editItem = (item: Item) => {
    setupAddForm()
    populateAddItemForm(itemToFormValues(item), controller.getProject())
    
    // Change modal title and button text
    const modalTitle = document.querySelector('#addModal .modal-title')
    if (modalTitle) modalTitle.textContent = 'Editar Item'
    
    const submitButton = document.getElementById('add-item-submit')
    if (submitButton) {
      submitButton.textContent = 'Actualizar'
      submitButton.onclick = () => {
        const formValues = getFormItemValues()
        controller.editItem(item.id, formValues)
        clearAddItemForm(controller.getProject())
        
        // Trigger modal close and re-render
        const closeEvent = new CustomEvent('closeAddModal')
        window.dispatchEvent(closeEvent)
        
        const renderEvent = new CustomEvent('renderAll')
        window.dispatchEvent(renderEvent)
      }
    }
  }
  
  const addNewItem = () => {
    const formValues = getFormItemValues()
    controller.addNewItem(formValues)
    clearAddItemForm(controller.getProject())
  }
  
  return {
    controller,
    initializeProject,
    renderTable,
    renderGantt,
    renderCriticalPaths,
    setupAddForm,
    setupDynamicItemButtons,
    editItem,
    addNewItem
  }
}

