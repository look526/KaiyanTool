import { migrationManager } from '../migrations/migration-manager';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await migrationManager.initializeMigrations();

    switch (command) {
      case 'status':
        const status = await migrationManager.getStatus();
        console.log('\n=== Migration Status ===');
        console.log(`Total: ${status.total}`);
        console.log(`Executed: ${status.executed}`);
        console.log(`Pending: ${status.pending}`);
        console.log('\nMigrations:');
        status.migrations.forEach((m) => {
          const statusIcon = m.executed ? '✓' : '○';
          console.log(`  ${statusIcon} ${m.id}: ${m.name}`);
          if (m.executedAt) {
            console.log(`    Executed at: ${m.executedAt.toISOString()}`);
          }
        });
        console.log('');
        break;

      case 'up':
        const targetId = args[1];
        const upResult = await migrationManager.migrateUp(targetId);
        console.log(`\n✓ Migrated ${upResult.executed} migration(s)\n`);
        break;

      case 'down':
        const rollbackId = args[1];
        const downResult = await migrationManager.migrateDown(rollbackId);
        console.log(`\n✓ Rolled back ${downResult.rolledBack} migration(s)\n`);
        break;

      case 'rollback':
        if (!args[1]) {
          console.error('Error: Migration ID required for rollback');
          process.exit(1);
        }
        await migrationManager.rollbackMigration(args[1]);
        console.log(`\n✓ Migration ${args[1]} rolled back\n`);
        break;

      case 'backup':
        if (!args[1]) {
          console.error('Error: Table name required for backup');
          process.exit(1);
        }
        const backupName = await migrationManager.createBackup(args[1]);
        console.log(`\n✓ Backup created: ${backupName}\n`);
        break;

      case 'restore':
        if (args.length < 3) {
          console.error('Error: Backup table name and target table name required');
          process.exit(1);
        }
        await migrationManager.restoreFromBackup(args[1], args[2]);
        console.log(`\n✓ Restored ${args[2]} from ${args[1]}\n`);
        break;

      case 'list-backups':
        const backups = await migrationManager.listBackups();
        console.log('\n=== Available Backups ===');
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          backups.forEach(backup => {
            console.log(`  - ${backup}`);
          });
        }
        console.log('');
        break;

      case 'cleanup':
        const keepDays = args[1] ? parseInt(args[1]) : 7;
        const cleanupResult = await migrationManager.cleanupOldBackups(keepDays);
        console.log(`\n✓ Cleaned up ${cleanupResult.cleaned} old backup(s)\n`);
        break;

      default:
        console.log(`
Usage: npm run migrate <command>

Commands:
  status                    Show migration status
  up [migrationId]          Run pending migrations (up to specific migration if specified)
  down [migrationId]        Rollback migrations (down to specific migration if specified)
  rollback <migrationId>     Rollback a specific migration
  backup <tableName>         Create a backup of a table
  restore <backup> <target>  Restore a table from backup
  list-backups              List all available backups
  cleanup [days]            Clean up old backups (default: 7 days)

Examples:
  npm run migrate status
  npm run migrate up
  npm run migrate up m002_add_document_indexes
  npm run migrate down
  npm run migrate rollback m001_add_project_member_roles
  npm run migrate backup Document
  npm run migrate restore Document_backup_1234567890 Document
  npm run migrate cleanup 30
        `);
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
