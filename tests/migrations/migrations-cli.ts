/* eslint-disable prettier/prettier */
import { ToolsMigrations } from './tools-migrations'

async function migrationsCli (args: string[] = process.argv) {
  if (args.includes('--create-table')) {
    await ToolsMigrations.createTable()
    process.exit(0)
  }

  if (args.includes('--delete-table')) {
    await ToolsMigrations.deleteTable()
    process.exit(0)
  }

  if (args.includes('--save-tools')) {
    await ToolsMigrations.saveTools()
    process.exit(0)
  }

  if (args.includes('--delete-tools')) {
    await ToolsMigrations.deleteTools()
    process.exit(0)
  }
}

(async () => await migrationsCli())()
