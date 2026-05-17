import { vi } from 'vitest'

// Supprimer les logs de la console pendant les tests sauf erreurs explicites
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'info').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
