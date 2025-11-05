import { describe, it, expect, beforeEach } from 'vitest'
import { IMilestoneData, Milestone } from '../../../src/models/Milestone'
import { Process } from '../../../src/models/Process'
import { SpendingMethod } from '../../../src/controllers/ProjectController'

describe('Milestone', () => {
  let milestone: Milestone
  let parent: Process

  beforeEach(() => {
    parent = new Process(1, 'Parent Process')
    milestone = new Milestone(2, 'Test Milestone', parent, 'Milestone detail', 200)
  })

  describe('constructor', () => {
    it('should create milestone with correct properties', () => {
      expect(milestone.id).toBe(2)
      expect(milestone.name).toBe('Test Milestone')
      expect(milestone._type).toBe('milestone')
      expect(milestone.parent).toBe(parent)
      expect(milestone.detail).toBe('Milestone detail')
      expect(milestone.getTotalCost()).toBe(200)
    })

    it('should create milestone without parent', () => {
      const orphanMilestone = new Milestone(3, 'Orphan Milestone')
      expect(orphanMilestone.parent).toBeUndefined()
      expect(orphanMilestone.getTotalCost()).toBe(0)
    })
  })

  describe('date management', () => {
    it('should return calculated start date when no actual date set', () => {
      const calculatedDate = new Date('2024-01-01')
      milestone.setCalculatedStartDate(calculatedDate)
      
      expect(milestone.getStartDate()).toEqual(calculatedDate)
      expect(milestone.getCalculatedStartDate()).toEqual(calculatedDate)
    })

    it('should prioritize actual start date over calculated', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-03')
      
      milestone.setCalculatedStartDate(calculatedDate)
      milestone.setActualStartDate(actualDate)
      
      expect(milestone.getStartDate()).toEqual(actualDate)
      expect(milestone.hasActualStartDate()).toBe(true)
    })

    it('should return undefined start date if none set', () => {
      expect(milestone.getStartDate()).toBeUndefined()
    })

    it('should return same date for start and end', () => {
      const date = new Date('2024-01-01')
      milestone.setCalculatedStartDate(date)
      
      expect(milestone.getEndDate()).toEqual(date)
      expect(milestone.getCalculatedEndDate()).toEqual(date)
    })
  })

  describe('delay calculation', () => {
    it('should calculate delay correctly', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-04')
      
      milestone.setCalculatedStartDate(calculatedDate)
      milestone.setActualStartDate(actualDate)
      
      expect(milestone.getDelayInDays()).toBe(3)
    })

    it('should return zero delay if no dates set', () => {
      expect(milestone.getDelayInDays()).toBe(0)
    })

    it('should return zero delay if only one date set', () => {
      milestone.setCalculatedStartDate(new Date('2024-01-01'))
      expect(milestone.getDelayInDays()).toBe(0)
      
      // Reset calculated date by setting it to a different date
      milestone.setCalculatedStartDate(new Date('2024-01-02'))
      milestone.setActualStartDate(new Date('2024-01-01'))
      expect(milestone.getDelayInDays()).toBe(-1)
    })
  })

  describe('cost management', () => {
    it('should return own cost as total cost', () => {
      expect(milestone.getTotalCost()).toBe(200)
    })

    it('should update total cost when cost changes', () => {
      milestone.setCost(300)
      expect(milestone.getTotalCost()).toBe(300)
    })
  })

  describe('data serialization', () => {
    it('should return correct milestone data structure', () => {
      const calculatedDate = new Date(2024, 0, 1)
      const actualDate = new Date(2024, 0, 3)
      
      milestone.setCalculatedStartDate(calculatedDate)
      milestone.setActualStartDate(actualDate)
      
      const data = milestone.data as IMilestoneData
      
      expect(data.id).toBe(2)
      expect(data.type).toBe('milestone')
      expect(data.name).toBe('Test Milestone')
      expect(data.detail).toBe('Milestone detail')
      expect(data.cost).toBe(200)
      expect(data.parentId).toBe(1)
      expect(data.actualStartDate).toBe('03-01-2024')
      expect(data.calculatedStartDate).toBe('01-01-2024')
    })

    it('should handle undefined dates in data', () => {
      const data = milestone.data as IMilestoneData
      
      expect(data.actualStartDate).toBeUndefined()
      expect(data.calculatedStartDate).toBeUndefined()
    })
  })

  describe('edit method', () => {
    it('should update milestone properties', () => {
      const newData: IMilestoneData = {
        id: 2,
        type: 'milestone',
        name: 'Updated Milestone',
        detail: 'Updated detail',
        startDate: '01-01-2024' as any,
        endDate: '01-01-2024' as any,
        cost: 350,
        parentId: 1,
        predecessorIds: [],
        actualStartDate: '03-01-2024' as any,
        calculatedStartDate: '01-01-2024' as any
      }
      
      milestone.edit(newData)
      
      expect(milestone.name).toBe('Updated Milestone')
      expect(milestone.detail).toBe('Updated detail')
      expect(milestone.getTotalCost()).toBe(350)
    })
  })

  describe('getDailyCost method', () => {
    beforeEach(() => {
      milestone.setCost(1000)
      milestone.setCalculatedStartDate(new Date('2024-01-01'))
    })

    it('should return zero cost before start date', () => {
      expect(milestone.getDailyCost(new Date('2023-12-31'), 'finished')).toBe(0)
      expect(milestone.getDailyCost(new Date('2023-12-31'), 'started')).toBe(0)
      expect(milestone.getDailyCost(new Date('2023-12-31'), 'linear')).toBe(0)
    })

    it('should return full cost on or after start date', () => {
      expect(milestone.getDailyCost(new Date('2024-01-01'), 'finished')).toBe(1000)
      expect(milestone.getDailyCost(new Date('2024-01-01'), 'started')).toBe(1000)
      expect(milestone.getDailyCost(new Date('2024-01-01'), 'linear')).toBe(1000)
      
      expect(milestone.getDailyCost(new Date('2024-01-02'), 'finished')).toBe(1000)
      expect(milestone.getDailyCost(new Date('2024-01-02'), 'started')).toBe(1000)
      expect(milestone.getDailyCost(new Date('2024-01-02'), 'linear')).toBe(1000)
    })

    it('should throw error when start date is not defined', () => {
      const milestoneWithoutDates = new Milestone(3, 'Test')
      expect(() => milestoneWithoutDates.getDailyCost(new Date('2024-01-03'), 'finished')).toThrow('Start date and end date must be defined to calculate daily cost')
    })
  })
})