import { describe, it, expect, beforeEach } from 'vitest'
import { Process } from '../../../src/models/Process'
import { Task } from '../../../src/models/Task'
import { Milestone } from '../../../src/models/Milestone'
import type { IProcessData } from '../../../src/models/Item'

describe('Process', () => {
  let process: Process
  let parentProcess: Process

  beforeEach(() => {
    parentProcess = new Process(1, 'Parent Process')
    process = new Process(2, 'Test Process', parentProcess, 'Process detail', 200, false)
  })

  describe('constructor', () => {
    it('should create process with correct properties', () => {
      expect(process._id).toBe(2)
      expect(process._name).toBe('Test Process')
      expect(process._type).toBe('process')
      expect(process._parent).toBe(parentProcess)
      expect(process._detail).toBe('Process detail')
      expect(process._cost).toBe(200)
      expect(process.getUseManualCost()).toBe(false)
      expect(process.children).toEqual([])
    })

    it('should create process with manual cost', () => {
      const manualProcess = new Process(3, 'Manual Process', undefined, undefined, 300, true)
      expect(manualProcess.getUseManualCost()).toBe(true)
    })
  })

  describe('children management', () => {
    it('should add children correctly', () => {
      const task = new Task(3, 'Child Task', 5)
      const milestone = new Milestone(4, 'Child Milestone')
      
      process.addChild(task)
      process.addChild(milestone)
      
      expect(process.children).toHaveLength(2)
      expect(process.children).toContain(task)
      expect(process.children).toContain(milestone)
      expect(task._parent).toBe(process)
      expect(milestone._parent).toBe(process)
    })

    it('should remove children correctly', () => {
      const task = new Task(3, 'Child Task', 5)
      process.addChild(task)
      
      expect(process.children).toHaveLength(1)
      
      const removed = process.removeChild(3)
      expect(removed).toBe(true)
      expect(process.children).toHaveLength(0)
      
      const notRemoved = process.removeChild(999)
      expect(notRemoved).toBe(false)
    })

    it('should inherit predecessors when adding children', () => {
      const predecessor = new Task(5, 'Predecessor', 3)
      const child = new Task(6, 'Child', 2)
      
      process.addPredecessor(predecessor)
      process.addChild(child)
      
      expect(child.predecessors.has(predecessor)).toBe(true)
    })
  })

  describe('terminal items', () => {
    it('should return terminal items correctly', () => {
      const task1 = new Task(3, 'Task 1', 5)
      const milestone1 = new Milestone(4, 'Milestone 1')
      const subProcess = new Process(5, 'Sub Process')
      const task2 = new Task(6, 'Task 2', 3)
      
      process.addChild(task1)
      process.addChild(milestone1)
      process.addChild(subProcess)
      subProcess.addChild(task2)
      
      const terminals = process.getTerminalItems()
      
      expect(terminals).toHaveLength(3)
      expect(terminals).toContain(task1)
      expect(terminals).toContain(milestone1)
      expect(terminals).toContain(task2)
      expect(terminals).not.toContain(subProcess)
    })

    it('should return empty array for process without children', () => {
      const terminals = process.getTerminalItems()
      expect(terminals).toEqual([])
    })
  })

  describe('date calculations', () => {
    it('should calculate start date from children', () => {
      const task1 = new Task(3, 'Task 1', 5)
      const task2 = new Task(4, 'Task 2', 3)
      
      task1.setCalculatedStartDate(new Date('2024-01-03'))
      task2.setCalculatedStartDate(new Date('2024-01-01'))
      
      process.addChild(task1)
      process.addChild(task2)
      
      expect(process.getStartDate()).toEqual(new Date('2024-01-01'))
    })

    it('should calculate end date from children', () => {
      const task1 = new Task(3, 'Task 1', 5)
      const task2 = new Task(4, 'Task 2', 3)
      
      task1.setCalculatedStartDate(new Date('2024-01-01'))
      task2.setCalculatedStartDate(new Date('2024-01-05'))
      
      process.addChild(task1)
      process.addChild(task2)
      
      expect(process.getEndDate()).toEqual(new Date('2024-01-08'))
    })

    it('should return undefined dates for empty process', () => {
      expect(process.getStartDate()).toBeUndefined()
      expect(process.getEndDate()).toBeUndefined()
    })

    it('should throw error when setting dates manually', () => {
      expect(() => process.setActualStartDate(new Date())).toThrow()
      expect(() => process.setCalculatedStartDate(new Date())).toThrow()
    })
  })

  describe('cost management', () => {
    it('should use manual cost when configured', () => {
      process.setUseManualCost(true)
      expect(process.getTotalCost()).toBe(200)
    })

    it('should calculate cost from children when not using manual', () => {
      const task1 = new Task(3, 'Task 1', 5, undefined, undefined, 100)
      const task2 = new Task(4, 'Task 2', 3, undefined, undefined, 150)
      
      process.addChild(task1)
      process.addChild(task2)
      
      expect(process.getTotalCost()).toBe(250)
    })

    it('should handle nested processes in cost calculation', () => {
      const subProcess = new Process(5, 'Sub Process', undefined, undefined, 0, false)
      const task1 = new Task(6, 'Task 1', 5, undefined, undefined, 100)
      const task2 = new Task(7, 'Task 2', 3, undefined, undefined, 50)
      
      subProcess.addChild(task1)
      process.addChild(subProcess)
      process.addChild(task2)
      
      expect(process.getTotalCost()).toBe(150)
    })
  })

  describe('delay calculation', () => {
    it('should return zero delay for processes', () => {
      expect(process.getDelayInDays()).toBe(0)
    })

    it('should return false for hasActualStartDate', () => {
      expect(process.hasActualStartDate()).toBe(false)
    })
  })

  describe('data serialization', () => {
    it('should return correct process data structure', () => {
      const task = new Task(3, 'Child Task', 5, undefined, undefined, 100)
      const milestone = new Milestone(4, 'Child Milestone', undefined, undefined, 50)
      
      process.addChild(task)
      process.addChild(milestone)
      process.setUseManualCost(true)
      
      const data = process.data as IProcessData
      
      expect(data.id).toBe(2)
      expect(data.type).toBe('process')
      expect(data.name).toBe('Test Process')
      expect(data.detail).toBe('Process detail')
      expect(data.cost).toBe(200)
      expect(data.processId).toBe(1)
      expect(data.useManualCost).toBe(true)
      expect(data.children).toHaveLength(2)
      expect(data.children[0].id).toBe(3)
      expect(data.children[1].id).toBe(4)
    })

    it('should handle empty process data', () => {
      const emptyProcess = new Process(8, 'Empty Process')
      const data = emptyProcess.data as IProcessData
      
      expect(data.children).toEqual([])
      expect(data.processId).toBe(-1)
      expect(data.useManualCost).toBe(false)
    })
  })
})