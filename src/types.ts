export type WishType = 'gift' | 'activity' | 'party' | 'dinner'

export interface Wish {
  id: string
  type: WishType
  title: string
  note?: string
  url?: string
  picture?: string
  price?: number
}

export interface ChipIn {
  name: string
  amount: number
  createdAt: string
}

export interface Claim {
  id: string
  wishId: string
  claimedBy: string
  claimedAt: string
  coordToken?: string
}

// Shape returned by GET /page (no passwordHash, no coordToken)
export interface Page {
  id: string
  personName: string
  wishes: Wish[]
  eventDate?: string
  createdAt: string
  updatedAt: string
}

export type ViewMode = 'owner' | 'coordinator' | 'friend'
