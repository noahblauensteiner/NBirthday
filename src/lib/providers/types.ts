import type { Page, Wish, Finish, EventLog } from '../../types'

export type { Page, Wish, Finish, EventLog }

export interface PageResult {
  id: string
  personName: string
  createdAt: string
}

export class ProviderError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ProviderError'
  }
}

export interface DataProvider {
  // Discovery
  searchPages(name: string): Promise<PageResult[]>

  // Page CRUD
  getPage(pageId: string): Promise<Page>
  createPage(
    personName: string,
    passwordHash: string,
    wishes?: Wish[],
  ): Promise<{ id: string; coordToken: string }>
  updatePage(
    pageId: string,
    passwordHash: string,
    patch: { wishes?: Wish[]; personName?: string },
  ): Promise<Page>
  verifyPassword(pageId: string, passwordHash: string): Promise<{ valid: boolean }>

  // Finishes
  getFinishes(pageId: string): Promise<Finish[]>
  createFinish(pageId: string, wishId: string, finishedBy: string): Promise<Finish>
  deleteFinish(pageId: string, finishId: string): Promise<void>

  // Events (owner/coord token required for reads)
  getEvents(pageId: string, token: string): Promise<EventLog[]>
  createEvent(
    pageId: string,
    event: { type: 'finish' | 'chipin'; wishId: string; actorName: string; amount?: number },
  ): Promise<EventLog>
}
