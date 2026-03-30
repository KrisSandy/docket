// Database migrations are handled by Dexie's versioning system.
// Add new versions in schema.ts when schema changes are needed.
// This file is reserved for data migration logic that runs
// after schema upgrades (e.g., backfilling new fields).

export async function runDataMigrations(): Promise<void> {
  // No data migrations needed for v1
}
