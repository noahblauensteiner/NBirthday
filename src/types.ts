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

export interface Session {
  name: string
  wishes: Wish[]
  passwordHash: string
}
