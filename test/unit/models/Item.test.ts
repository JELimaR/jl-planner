import { describe, it, expect, beforeEach } from 'vitest'
import { IItemData, Item } from '../../../src/models/Item'
import { SpendingMethod } from '../../../src/controllers/ProjectController'
import { DAY_MS } from '../../../src/views/ganttHelpers'
import { Process } from '../../../src/models/Process'
// Clase concreta para testing de la clase abstracta Item
class TestItem extends Item {
  getDailyCost(date: Date, method: SpendingMethod): number {
    throw new Error('Method not implemented.')
  }
  private startDate?: Date
  private endDate?: Date
  private calculatedStartDate?: Date
  private actualStartDate?: Date

  constructor(id: number, name: string, parent?: Item, detail?: string, cost: number = 0) {
    super(id, 'task', name, parent, detail, cost)
  }

  getStartDate(): Date | undefined {
    return this.actualStartDate || this.calculatedStartDate
  }

  getEndDate(): Date | undefined {
    const start = this.getStartDate()
    if (!start) return undefined
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return end
  }

  getCalculatedStartDate(): Date | undefined {
    return this.calculatedStartDate
  }

  getCalculatedEndDate(): Date | undefined {
    const start = this.getCalculatedStartDate()
    if (!start) return undefined
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return end
  }

  setCalculatedStartDate(date: Date | undefined): void {
    this.calculatedStartDate = date
  }

  setActualStartDate(date: Date | undefined): void {
    this.actualStartDate = date
  }

  hasActualStartDate(): boolean {
    return !!this.actualStartDate
  }

  getDelayInDays(): number {
    if (!this.actualStartDate || !this.calculatedStartDate) return 0
    const diff = this.actualStartDate.getTime() - this.calculatedStartDate.getTime()
    return Math.ceil(diff / DAY_MS)
  }

  /*get data(): IItemData {
    return {
      id: this.id,
      type: this._type,
      name: this.name,
      detail: this.detail,
      cost: this.getTotalCost(),
      parentId: this.parent?.id ?? -1,
      predecessorIds: Array.from(this.predecessors).map((item) => item.id),
      startDate: formatDateToDisplay(this.getStartDate())!,
      endDate: formatDateToDisplay(this.getEndDate())!,
    }
  }*/
}

describe('Item', () => {
  let item: TestItem
  let parent: Process

  beforeEach(() => {
    parent = new Process(1, 'Parent Process')
    item = new TestItem(2, 'Test Item', parent, 'Test detail', 100)
  })

  describe('constructor', () => {
    it('should create item with correct properties', () => {
      expect(item.id).toBe(2)
      expect(item.name).toBe('Test Item')
      expect(item._type).toBe('task')
      expect(item.parent).toBe(parent)
      expect(item.detail).toBe('Test detail')
      expect(item.getTotalCost()).toBe(100)
      expect(item.isCritical).toBe(false)
    })

    it('should create item without parent', () => {
      const orphanItem = new TestItem(3, 'Orphan Item')
      expect(orphanItem.parent).toBeUndefined()
      expect(orphanItem.getTotalCost()).toBe(0)
    })
  })

  describe('critical path methods', () => {
    it('should set and reset critical status', () => {
      expect(item.isCritical).toBe(false)
      
      item.setCritical()
      expect(item.isCritical).toBe(true)
      
      item.resetCritical()
      expect(item.isCritical).toBe(false)
    })
  })

  describe('cost management', () => {
    it('should set cost correctly', () => {
      item.setCost(200)
      expect(item.getTotalCost()).toBe(200)
    })

    it('should not allow negative cost', () => {
      item.setCost(-50)
      expect(item.getTotalCost()).toBe(0)
    })

    it('should get total cost', () => {
      expect(item.getTotalCost()).toBe(100)
    })
  })

  describe('predecessors management', () => {
    it('should add predecessors', () => {
      const predecessor = new TestItem(4, 'Predecessor')
      item.addPredecessor(predecessor)
      
      expect(item.predecessors.has(predecessor)).toBe(true)
      expect(item.predecessors.size).toBe(1)
    })

    it('should not add duplicate predecessors', () => {
      const predecessor = new TestItem(4, 'Predecessor')
      item.addPredecessor(predecessor)
      item.addPredecessor(predecessor)
      
      expect(item.predecessors.size).toBe(1)
    })
  })

  describe('data serialization', () => {
    it('should return correct data structure', () => {
      const predecessor = new TestItem(5, 'Predecessor')
      item.addPredecessor(predecessor)
      
      const data = item.data
      
      expect(data.id).toBe(2)
      expect(data.type).toBe('task')
      expect(data.name).toBe('Test Item')
      expect(data.detail).toBe('Test detail')
      expect(data.cost).toBe(100)
      expect(data.parentId).toBe(1)
      expect(data.predecessorIds).toEqual([5])
    })

    it('should handle item without parent', () => {
      const orphanItem = new TestItem(6, 'Orphan')
      const data = orphanItem.data
      
      expect(data.parentId).toBe(-1)
    })
  })

  describe('date management', () => {
    it('should handle calculated dates', () => {
      const date = new Date('2024-01-01')
      item.setCalculatedStartDate(date)
      
      expect(item.getCalculatedStartDate()).toEqual(date)
      expect(item.getStartDate()).toEqual(date)
    })

    it('should prioritize actual over calculated dates', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-05')
      
      item.setCalculatedStartDate(calculatedDate)
      item.setActualStartDate(actualDate)
      
      expect(item.getStartDate()).toEqual(actualDate)
      expect(item.hasActualStartDate()).toBe(true)
    })

    it('should calculate delay correctly', () => {
      const calculatedDate = new Date('2024-01-01')
      const actualDate = new Date('2024-01-05')
      
      item.setCalculatedStartDate(calculatedDate)
      item.setActualStartDate(actualDate)
      
      expect(item.getDelayInDays()).toBe(4)
    })
  })
})