import { randomUUID } from 'node:crypto'

export function generateMerchantReference(): string {
  return randomUUID()
}
