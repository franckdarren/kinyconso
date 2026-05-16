import 'dotenv/config'

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL est manquant. Renseigne-le dans .env.local.')
}

const SQL_DIR = path.resolve(process.cwd(), 'src/db/sql')

async function main() {
  const files = (await readdir(SQL_DIR)).filter((f) => f.endsWith('.sql')).sort()

  if (files.length === 0) {
    console.warn('Aucun fichier .sql trouvé dans src/db/sql/')
    process.exit(0)
  }

  const client = postgres(connectionString!, { max: 1, prepare: false })

  try {
    for (const file of files) {
      const filePath = path.join(SQL_DIR, file)
      const sql = await readFile(filePath, 'utf-8')
      console.warn(`▶ Exécution de ${file}…`)
      await client.unsafe(sql)
      console.warn(`✓ ${file} appliqué`)
    }
    console.warn('✅ Tous les scripts SQL ont été appliqués.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('❌ Erreur lors de l’application des scripts SQL :', err)
  process.exit(1)
})
