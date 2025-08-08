import { describe, it, expect, beforeEach } from 'vitest'
import { Task } from '../../src/models/Task'
import { Process } from '../../src/models/Process'
import type { ITaskData } from '../../src/models/Item'

describe('Task', () => {
  let task: Task
  let parent: Process

  beforeEach(() => {
    parent = new Process(1, 'Parent Process')
    task = new Task(2, 'Test Task', 5, parent, 'Task detail', 150)
  })

  describe('constructor', () => {
    it('should create task with correct properties', () => {
      expect(task._id).toBe(2)
      expect(task._name).toBe('Test Task')
      expect(task._type).toBe('task')
      expect(task.duration).toBe(5)
      expect(task._parent).toBe(parent)
      expect(task._detail).toBe('Task detail')
      expect(task._cost).toBe(150)
    })

    it('should create task without parent', () => {
      const orphanTask = new Task(3, 'Orphan Task', 3)
      expect(orphanTask._parent).toBeUndefined()
      expect(orphanTask._cost).toBe(0)
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
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-03')
      
      task.setCalculatedStartDate(calculatedDate)
      task.setActualStartDate(actualDate)
      task.setManualDuration(7)
      
      const data = task.data as ITaskData
      
      expect(data.id).toBe(2)
      expect(data.type).toBe('task')
      expect(data.name).toBe('Test Task')
      expect(data.detail).toBe('Task detail')
      expect(data.cost).toBe(150)
      expect(data.processId).toBe(1)
      expect(data.duration).toBe(7)
      expect(data.actualStartDate).toBe(actualDate.toISOString())
      expect(data.calculatedStartDate).toBe(calculatedDate.toISOString())
      expect(data.manualDuration).toBe(7)
    })

    it('should handle undefined dates in data', () => {
      const data = task.data as ITaskData
      
      expect(data.actualStartDate).toBeUndefined()
      expect(data.calculatedStartDate).toBeUndefined()
      expect(data.manualDuration).toBeUndefined()
    })
  })
})