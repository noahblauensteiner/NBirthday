import {
  ApiError,
  getPage as apiGetPage,
  createPage as apiCreatePage,
  updatePage as apiUpdatePage,
  verifyPassword as apiVerifyPassword,
  searchPages as apiSearchPages,
  getFinishes as apiGetFinishes,
  createFinish as apiCreateFinish,
  deleteFinish as apiDeleteFinish,
  getEvents as apiGetEvents,
  createEvent as apiCreateEvent,
} from '../api'
import type { DataProvider, PageResult } from './types'
import { ProviderError } from './types'
import type { Page, Wish, Finish, EventLog } from '../../types'

function rethrow(err: unknown): never {
  if (err instanceof ApiError) throw new ProviderError(err.status, err.message)
  throw err
}

async function wrap<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise
  } catch (err) {
    rethrow(err)
  }
}

export class NetlifyProvider implements DataProvider {
  searchPages(name: string): Promise<PageResult[]> {
    return wrap(apiSearchPages(name).then(r => r.pages))
  }

  getPage(pageId: string): Promise<Page> {
    return wrap(apiGetPage(pageId))
  }

  createPage(personName: string, passwordHash: string, wishes?: Wish[]): Promise<{ id: string; coordToken: string }> {
    return wrap(apiCreatePage(personName, passwordHash, wishes))
  }

  updatePage(pageId: string, passwordHash: string, patch: { wishes?: Wish[]; personName?: string }): Promise<Page> {
    return wrap(apiUpdatePage(pageId, passwordHash, patch))
  }

  verifyPassword(pageId: string, passwordHash: string): Promise<{ valid: boolean }> {
    return wrap(apiVerifyPassword(pageId, passwordHash))
  }

  getFinishes(pageId: string): Promise<Finish[]> {
    return wrap(apiGetFinishes(pageId))
  }

  createFinish(pageId: string, wishId: string, finishedBy: string): Promise<Finish> {
    return wrap(apiCreateFinish(pageId, wishId, finishedBy))
  }

  deleteFinish(pageId: string, finishId: string): Promise<void> {
    return wrap(apiDeleteFinish(pageId, finishId))
  }

  getEvents(pageId: string, token: string): Promise<EventLog[]> {
    return wrap(apiGetEvents(pageId, token))
  }

  createEvent(pageId: string, event: { type: 'finish' | 'chipin'; wishId: string; actorName: string; amount?: number }): Promise<EventLog> {
    return wrap(apiCreateEvent(pageId, event))
  }
}
