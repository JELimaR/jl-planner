import { describe, it, expect, beforeEach } from 'vitest'
import { ITaskData, Task } from '../../../src/models/Task'
import { Process } from '../../../src/models/Process'
import { SpendingMethod } from '../../../src/controllers/ProjectController'

describe('Task', () => {
  let task: Task
  let parent: Process

  beforeEach(() => {
    parent = new Process(1, 'Parent Process')
    task = new Task(2, 'Test Task', 5, parent, 'Task detail', 150)
  })

  describe('constructor', () => {
    it('should create task with correct properties', () => {
      expect(task.id).toBe(2)
      expect(task.name).toBe('Test Task')
      expect(task._type).toBe('task')
      expect(task.duration).toBe(5)
      expect(task.parent).toBe(parent)
      expect(task.detail).toBe('Task detail')
      expect(task.getTotalCost()).toBe(150)
    })

    it('should create task without parent', () => {
      const orphanTask = new Task(3, 'Orphan Task', 3)
      expect(orphanTask.parent).toBeUndefined()
      expect(orphanTask.getTotalCost()).toBe(0)
    })
  })

  describe('duration management', () => {
    it('should return calculated duration by default', () => {
      expect(task.duration).toBe(5)
    })

    it('should prioritize manual duration', () => {
      task.setManualDuration(8)
      expect(task.duration).toBe(8)
    })

    it('should not allow zero or negative manual duration', () => {
      task.setManualDuration(0)
      expect(task.duration).toBe(1)
      
      task.setManualDuration(-3)
      expect(task.duration).toBe(1)
    })
  })

  describe('date calculations', () => {
    it('should calculate end date from start date and duration', () => {
      const startDate = new Date('2024-01-01')
      task.setCalculatedStartDate(startDate)
      
      const endDate = task.getEndDate()
      expect(endDate).toEqual(new Date('2024-01-06'))
    })

    it('should return undefined end date if no start date', () => {
      expect(task.getEndDate()).toBeUndefined()
    })

    it('should calculate calculated end date', () => {
      const startDate = new Date('2024-01-01')
      task.setCalculatedStartDate(startDate)
      
      const endDate = task.getCalculatedEndDate()
      expect(endDate).toEqual(new Date('2024-01-06'))
    })

    it('should prioritize actual start date over calculated', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-03')
      
      task.setCalculatedStartDate(calculatedDate)
      task.setActualStartDate(actualDate)
      
      expect(task.getStartDate()).toEqual(actualDate)
      expect(task.hasActualStartDate()).toBe(true)
    })
  })

  describe('delay calculation', () => {
    it('should calculate delay correctly', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-04')
      
      task.setCalculatedStartDate(calculatedDate)
      task.setActualStartDate(actualDate)
      
      expect(task.getDelayInDays()).toBe(3)
    })

    it('should return zero delay if no dates set', () => {
      expect(task.getDelayInDays()).toBe(0)
    })

    it('should return zero delay if only one date set', () => {
      task.setCalculatedStartDate(new Date('2024-01-01'))
      expect(task.getDelayInDays()).toBe(0)
      
      task.setCalculatedStartDate(undefined)
      task.setActualStartDate(new Date('2024-01-01'))
      expect(task.getDelayInDays()).toBe(0)
    })
  })

  describe('cost management', () => {
    it('should return own cost as total cost', () => {
      expect(task.getTotalCost()).toBe(150)
    })

    it('should update total cost when cost changes', () => {
      task.setCost(200)
      expect(task.getTotalCost()).toBe(200)
    })
  })

  describe('data serialization', () => {
    it('should return correct task data structure', () => {
      const calculatedDate = new Date(2024, 0, 1)
      const actualDate = new Date(2024, 0, 3)
      
      task.setCalculatedStartDate(calculatedDate)
      task.setActualStartDate(actualDate)
      task.setManualDuration(7)
      
      const data = task.data;
      
      expect(data.id).toBe(2)
      expect(data.type).toBe('task')
      expect(data.name).toBe('Test Task')
      expect(data.detail).toBe('Task detail')
      expect(data.cost).toBe(150)
      expect(data.parentId).toBe(1)
      expect(data.duration).toBe(7)
      expect(data.actualStartDate).toBe('03-01-2024')
      expect(data.calculatedStartDate).toBe('01-01-2024')
      expect(data.manualDuration).toBe(7)
    })

    it('should handle undefined dates in data', () => {
      const data = task.data;
      
      expect(data.actualStartDate).toBeUndefined()
      expect(data.calculatedStartDate).toBeUndefined()
      expect(data.manualDuration).toBeUndefined()
    })
  })

  describe('edit method', () => {
    it('should update task properties', () => {
      const newData: ITaskData = {
        id: 2,
        type: 'task',
        name: 'Updated Task',
        detail: 'Updated detail',
        startDate: '01-01-2024' as any,
        endDate: '01-06-2024' as any,
        cost: 300,
        parentId: 1,
        predecessorIds: [],
        duration: 10,
        manualDuration: 8,
        actualStartDate: '02-01-2024' as any,
        calculatedStartDate: '01-01-2024' as any
      }
      
      task.edit(newData)
      
      expect(task.name).toBe('Updated Task')
      expect(task.detail).toBe('Updated detail')
      expect(task.getTotalCost()).toBe(300)
      expect(task.duration).toBe(8)
    })

    it('should reset manual duration if not provided', () => {
      task.setManualDuration(10)
      expect(task.duration).toBe(10)
      
      const newData: ITaskData = {
        id: 2,
        type: 'task',
        name: 'Updated Task',
        detail: 'Updated detail',
        startDate: '01-01-2024' as any,
        endDate: '01-06-2024' as any,
        cost: 300,
        parentId: 1,
        predecessorIds: [],
        duration: 5
      }
      
      task.edit(newData)
      expect(task.duration).toBe(5)
    })
  })

  describe('getDailyCost method', () => {
    beforeEach(() => {
      task.setCost(1000)
      task.setCalculatedStartDate(new Date('2024-01-01'))
    })

    it('should calculate daily cost for finished method', () => {
      // Before end date
      expect(task.getDailyCost(new Date('2024-01-03'), 'finished')).toBe(1000)
      
      // After end date
      expect(task.getDailyCost(new Date('2024-01-10'), 'finished')).toBe(0)
    })

    it('should calculate daily cost for started method', () => {
      // Before start date
      expect(task.getDailyCost(new Date('2023-12-30'), 'started')).toBe(0)
      
      // After start date
      expect(task.getDailyCost(new Date('2024-01-03'), 'started')).toBe(1000)
    })

    it('should calculate daily cost for linear method', () => {
      // Before start date
      expect(task.getDailyCost(new Date('2023-12-30'), 'linear')).toBe(0)
      
      // After end date
      expect(task.getDailyCost(new Date('2024-01-10'), 'linear')).toBe(1000)
      
      // During the task (day 3 of 5)
      const cost = task.getDailyCost(new Date('2024-01-03'), 'linear')
      expect(cost).toBeCloseTo(600, 0) // 1000 * 3/5 = 600
    })

    it('should throw error for invalid spending method', () => {
      expect(() => task.getDailyCost(new Date('2024-01-03'), 'invalid' as SpendingMethod)).toThrow('Invalid spending method')
    })

    it('should throw error when start or end date is not defined', () => {
      const taskWithoutDates = new Task(3, 'Test', 5)
      expect(() => taskWithoutDates.getDailyCost(new Date('2024-01-03'), 'finished')).toThrow('Start date and end date must be defined to calculate daily cost')
    })
  })
})