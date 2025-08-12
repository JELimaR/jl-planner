import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IProjectData, Project } from '../../../src/models/Project'
import { ITaskData, Task } from '../../../src/models/Task'
import { Milestone, IMilestoneData } from '../../../src/models/Milestone'
import { Process, IProcessData } from '../../../src/models/Process'
import { TDateString } from '../../../src/models/dateFunc'

describe('Project', () => {
  let project: Project
  let startDate: Date

  beforeEach(() => {
    startDate = new Date('2024-01-01')
    project = new Project('test-project', startDate)
  })

  describe('Constructor and Basic Properties', () => {
    it('should create a project with correct initial values', () => {
      expect(project.getId()).toBe('test-project')
      expect(project.getTitle()).toBe('Proyecto sin título')
      expect(project.getSubtitle()).toBe('')
      expect(project.getProjectStartDate()).toEqual(startDate)
    })

    it('should create start and end milestones', () => {
      const startMilestone = project.getStartMilestone()
      const endMilestone = project.getEndMilestone()
      
      expect(startMilestone).toBeDefined()
      expect(endMilestone).toBeDefined()
      expect(startMilestone.id).toBe(1000)
      expect(endMilestone.id).toBe(1002)
      expect(startMilestone.name).toBe('start')
      expect(endMilestone.name).toBe('end')
    })

    it('should create root process', () => {
      const root = project.getRoot()
      expect(root).toBeDefined()
      expect(root.id).toBe(1001)
      expect(root.name).toBe('Project Root Process')
    })
  })

  describe('Title and Subtitle Management', () => {
    it('should set and get title', () => {
      project.setTitle('New Project Title')
      expect(project.getTitle()).toBe('New Project Title')
    })

    it('should set and get subtitle', () => {
      project.setSubtitle('Project Subtitle')
      expect(project.getSubtitle()).toBe('Project Subtitle')
    })
  })

  describe('Date Management', () => {
    it('should change start date', () => {
      const newDate = new Date('2024-02-01')
      project.changeStartDate(newDate)
      expect(project.getProjectStartDate()).toEqual(newDate)
    })

    it('should get project end date', () => {
      const endDate = project.getProjectEndDate()
      expect(endDate).toBeDefined()
      expect(endDate).toBeInstanceOf(Date)
    })
  })

  describe('Item Management', () => {
    let task: Task
    let milestone: Milestone
    let process: Process

    beforeEach(() => {
      task = new Task(100, 'Test Task', 5, project.getRoot())
      milestone = new Milestone(101, 'Test Milestone', project.getRoot())
      process = new Process(102, 'Test Process', project.getRoot())
    })

    it('should add items to project', () => {
      project.addItem(task)
      project.addItem(milestone)
      project.addItem(process)

      expect(project.getItemById(100)).toBe(task)
      expect(project.getItemById(101)).toBe(milestone)
      expect(project.getItemById(102)).toBe(process)
    })

    it('should add item with parent process', () => {
      const parentProcess = new Process(200, 'Parent Process', project.getRoot())
      project.addItem(parentProcess)
      project.addItem(task, parentProcess)

      expect(task.parent).toBe(parentProcess)
      expect(parentProcess.children).toContain(task)
    })

    it('should automatically add start milestone as predecessor if no dependencies', () => {
      project.addItem(task)
      expect(task.predecessors.has(project.getStartMilestone())).toBe(true)
    })

    it('should get all items', () => {
      project.addItem(task)
      project.addItem(milestone)
      
      const allItems = project.getAllItems()
      expect(allItems.has(100)).toBe(true)
      expect(allItems.has(101)).toBe(true)
      expect(allItems.has(1000)).toBe(true) // start milestone
      expect(allItems.has(1001)).toBe(true) // root process
      expect(allItems.has(1002)).toBe(true) // end milestone
    })

    it('should return undefined for non-existent item', () => {
      expect(project.getItemById(999)).toBeUndefined()
    })
  })

  describe('Relations Management', () => {
    let task1: Task
    let task2: Task

    beforeEach(() => {
      task1 = new Task(100, 'Task 1', 3, project.getRoot())
      task2 = new Task(101, 'Task 2', 5, project.getRoot())
      project.addItem(task1)
      project.addItem(task2)
    })

    it('should add relation between items', () => {
      project.addRelation(task1, task2)
      expect(task2.predecessors.has(task1)).toBe(true)
    })

    it('should prevent self-relation', () => {
      project.addRelation(task1, task1)
      expect(task1.predecessors.has(task1)).toBe(false)
    })

    it('should throw error for circular dependency', () => {
      project.addRelation(task1, task2)
      expect(() => project.addRelation(task2, task1)).toThrow()
    })
  })

  describe('Item Editing', () => {
    let task: Task
    let taskData: ITaskData

    beforeEach(() => {
      task = new Task(100, 'Original Task', 5, project.getRoot())
      project.addItem(task)
      
      taskData = {
        id: 100,
        type: 'task',
        name: 'Updated Task',
        detail: 'Updated detail',
        cost: 1000,
        duration: 7,
        startDate: '2024-01-01' as TDateString,
        endDate: '2024-01-07' as TDateString,
        parentId: project.getRoot().id,
        predecessorIds: []
      }
    })

    it('should edit existing item', () => {
      project.editItem(taskData)
      
      const updatedTask = project.getItemById(100) as Task
      expect(updatedTask.name).toBe('Updated Task')
      expect(updatedTask.detail).toBe('Updated detail')
      expect(updatedTask.getTotalCost()).toBe(1000)
      expect(updatedTask.duration).toBe(7)
    })

    it('should throw error when editing non-existent item', () => {
      taskData.id = 999
      expect(() => project.editItem(taskData)).toThrow('Item with ID 999 not found')
    })

    it('should throw error when changing item type', () => {
      (taskData as any).type = 'milestone';
      expect(() => project.editItem(taskData)).toThrow('Cannot change the type of an item')
    })

    it('should throw error when changing parent process', () => {
      const newProcess = new Process(200, 'New Process', project.getRoot())
      project.addItem(newProcess)
      taskData.parentId = newProcess.id
      expect(() => project.editItem(taskData)).toThrow('Cannot change the parent process of an item')
    })
  })

  describe('Critical Paths', () => {
    it('should get critical paths', () => {
      const task1 = new Task(100, 'Task 1', 3, project.getRoot())
      const task2 = new Task(101, 'Task 2', 5, project.getRoot())
      project.addItem(task1)
      project.addItem(task2)
      project.addRelation(task1, task2)
      
      const criticalPaths = project.getCriticalPaths()
      expect(criticalPaths).toBeDefined()
      expect(Array.isArray(criticalPaths)).toBe(true)
    })
  })

  describe('Delayed Items', () => {
    it('should get delayed items', () => {
      const task = new Task(100, 'Test Task', 5, project.getRoot())
      project.addItem(task)
      
      // Set actual start date later than calculated
      task.setCalculatedStartDate(new Date('2024-01-01'))
      task.setActualStartDate(new Date('2024-01-05'))
      
      const delayedItems = project.getDelayedItems()
      expect(delayedItems).toContain(task)
    })

    it('should return empty array when no delayed items', () => {
      const delayedItems = project.getDelayedItems()
      expect(delayedItems).toEqual([])
    })
  })

  describe('Project Delay Calculation', () => {
    it('should calculate total project delay', () => {
      const delay = project.getTotalProjectDelayInDays()
      expect(typeof delay).toBe('number')
      expect(delay).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Traversal', () => {
    it('should traverse all items', () => {
      const task1 = new Task(100, 'Task 1', 3, project.getRoot())
      const task2 = new Task(101, 'Task 2', 5, project.getRoot())
      const process = new Process(102, 'Process', project.getRoot())
      const childTask = new Task(103, 'Child Task', 2, process)
      
      project.addItem(task1)
      project.addItem(task2)
      project.addItem(process)
      project.addItem(childTask, process)
      
      const visitedItems: any[] = []
      project.traverse((item, depth, parent) => {
        visitedItems.push({ item, depth, parent })
      })
      
      expect(visitedItems.length).toBeGreaterThan(0)
      expect(visitedItems.some(v => v.item === task1)).toBe(true)
      expect(visitedItems.some(v => v.item === task2)).toBe(true)
      expect(visitedItems.some(v => v.item === process)).toBe(true)
      expect(visitedItems.some(v => v.item === childTask)).toBe(true)
    })
  })

  describe('Data Serialization', () => {
    it('should get project data', () => {
      project.setTitle('Test Project')
      project.setSubtitle('Test Subtitle')
      
      const task = new Task(100, 'Test Task', 5, project.getRoot())
      project.addItem(task)
      
      const data = project.getData()
      
      expect(data.id).toBe('test-project')
      expect(data.title).toBe('Test Project')
      expect(data.subtitle).toBe('Test Subtitle')
      expect(data.startDate).toBeDefined()
      expect(data.endDate).toBeDefined()
      expect(data.items).toBeDefined()
      expect(data.items.length).toBeGreaterThan(0)
    })

    it('should get header data', () => {
      project.setTitle('Header Test')
      project.setSubtitle('Header Subtitle')
      
      const header = project.getHeaderData()
      
      expect(header.id).toBe('test-project')
      expect(header.title).toBe('Header Test')
      expect(header.subtitle).toBe('Header Subtitle')
      expect(header.startDate).toBeDefined()
      expect(header.endDate).toBeDefined()
    })
  })

  describe('Project Deserialization', () => {
    it('should deserialize project from data', () => {
      const projectData: IProjectData = {
        id: 'deserialized-project',
        title: 'Deserialized Project',
        subtitle: 'Test Subtitle',
        startDate: '01-01-2024' as TDateString,
        endDate: '01-31-2024' as TDateString,
        criticalPaths: [],
        items: [
          {
            id: 100,
            type: 'task',
            name: 'Test Task',
            detail: 'Task detail',
            cost: 500,
            duration: 5,
            parentId: 1001,
            predecessorIds: [1000]
          } as ITaskData,
          {
            id: 101,
            type: 'milestone',
            name: 'Test Milestone',
            detail: 'Milestone detail',
            cost: 0,
            parentId: 1001,
            predecessorIds: [100]
          } as IMilestoneData
        ]
      }
      
      const deserializedProject = Project.deserializeProject(projectData)
      
      expect(deserializedProject.getId()).toBe('deserialized-project')
      expect(deserializedProject.getTitle()).toBe('Deserialized Project')
      expect(deserializedProject.getSubtitle()).toBe('Test Subtitle')
      expect(deserializedProject.getItemById(100)).toBeDefined()
      expect(deserializedProject.getItemById(101)).toBeDefined()
      
      const task = deserializedProject.getItemById(100) as Task
      const milestone = deserializedProject.getItemById(101) as Milestone
      
      expect(task.name).toBe('Test Task')
      expect(task.duration).toBe(5)
      expect(milestone.name).toBe('Test Milestone')
      expect(milestone.predecessors.has(task)).toBe(true)
    })

    it('should handle process with children in deserialization', () => {
      const projectData: IProjectData = {
        id: 'process-project',
        title: 'Process Project',
        subtitle: '',
        startDate: '01-01-2024',
        endDate: '01-31-2024',
        items: [
          {
            id: 200,
            type: 'process',
            name: 'Main Process',
            detail: 'Process detail',
            cost: 0,
            parentId: 1001,
            predecessorIds: [1000],
            children: [
              {
                id: 201,
                type: 'task',
                name: 'Child Task',
                detail: 'Child task detail',
                cost: 300,
                duration: 3,
                parentId: 200,
                predecessorIds: []
              } as ITaskData
            ]
          } as IProcessData
        ]
      }
      
      const deserializedProject = Project.deserializeProject(projectData)
      
      const process = deserializedProject.getItemById(200) as Process
      const childTask = deserializedProject.getItemById(201) as Task
      
      expect(process).toBeDefined()
      expect(childTask).toBeDefined()
      expect(process.children).toContain(childTask)
      expect(childTask.parent).toBe(process)
    })
  })

  describe('Error Handling', () => {
    it('should handle duplicate item IDs', () => {
      const task1 = new Task(100, 'Task 1', 3, project.getRoot())
      const task2 = new Task(100, 'Task 2', 5, project.getRoot())
      
      project.addItem(task1)
      
      // Should log error but not throw
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      project.addItem(task2)
      
      expect(consoleSpy).toHaveBeenCalledWith('Ya existe el item: ID 100')
      consoleSpy.mockRestore()
    })
  })
})