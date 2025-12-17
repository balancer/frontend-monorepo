import { getPoolMigrations } from './getPoolMigrations'

describe('Fetching pool migration metadata', () => {
  it('should get at least some migrations', async () => {
    const migrations = await getPoolMigrations()

    expect(migrations.length).toBeGreaterThan(0)
    expect(migrations[0].new).not.toBeUndefined()
    expect(migrations[0].old).not.toBeUndefined()
  })
})
