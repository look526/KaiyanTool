import { prisma } from '../lib/prisma';

interface Migration {
  id: string;
  name: string;
  description: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
  createdAt: Date;
  executedAt?: Date;
}

interface MigrationRecord {
  id: string;
  name: string;
  executedAt: Date;
}

class MigrationManager {
  private migrations: Map<string, Migration> = new Map();
  private migrationTable = '_migrations';

  async ensureMigrationTable() {
    await prisma.$queryRaw`
      CREATE TABLE IF NOT EXISTS "${this.migrationTable}" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  registerMigration(migration: Omit<Migration, 'createdAt'>) {
    const fullMigration: Migration = {
      ...migration,
      createdAt: new Date(),
    };
    this.migrations.set(migration.id, fullMigration);
    return this;
  }

  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    await this.ensureMigrationTable();
    const records = await prisma.$queryRaw<MigrationRecord[]>`
      SELECT * FROM "${this.migrationTable}" ORDER BY "executedAt" ASC;
    `;
    return records;
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const executed = await this.getExecutedMigrations();
    const executedIds = new Set(executed.map(r => r.id));

    return Array.from(this.migrations.values())
      .filter(m => !executedIds.has(m.id))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async executeMigration(migration: Migration) {
    console.log(`Executing migration: ${migration.name} (${migration.id})`);

    try {
      await migration.up();

      await prisma.$queryRaw`
        INSERT INTO "${this.migrationTable}" ("id", "name", "description", "executedAt")
        VALUES (${migration.id}, ${migration.name}, ${migration.description}, CURRENT_TIMESTAMP)
        ON CONFLICT ("id") DO NOTHING;
      `;

      console.log(`Migration ${migration.name} completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  async rollbackMigration(migrationId: string) {
    const migration = this.migrations.get(migrationId);

    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    if (!migration.down) {
      throw new Error(`Migration ${migration.name} does not support rollback`);
    }

    console.log(`Rolling back migration: ${migration.name} (${migrationId})`);

    try {
      await migration.down();

      await prisma.$queryRaw`
        DELETE FROM "${this.migrationTable}" WHERE "id" = ${migrationId};
      `;

      console.log(`Rollback of ${migration.name} completed successfully`);
      return { success: true };
    } catch (error) {
      console.error(`Rollback of ${migration.name} failed:`, error);
      throw error;
    }
  }

  async migrateUp(targetId?: string) {
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('No pending migrations to execute');
      return { executed: 0 };
    }

    const targetIndex = targetId
      ? pending.findIndex(m => m.id === targetId)
      : pending.length - 1;

    if (targetIndex === -1) {
      throw new Error(`Target migration ${targetId} not found in pending migrations`);
    }

    const toExecute = pending.slice(0, targetIndex + 1);
    let executed = 0;

    for (const migration of toExecute) {
      await this.executeMigration(migration);
      executed++;

      if (targetId && migration.id === targetId) {
        break;
      }
    }

    return { executed };
  }

  async migrateDown(targetId?: string) {
    const executed = await this.getExecutedMigrations();
    const toRollback = targetId
      ? executed.filter(r => r.id !== targetId)
      : [executed[executed.length - 1]];

    if (toRollback.length === 0) {
      console.log('No migrations to rollback');
      return { rolledBack: 0 };
    }

    let rolledBack = 0;

    for (const record of [...toRollback].reverse()) {
      const migration = this.migrations.get(record.id);

      if (!migration) {
        console.warn(`Migration ${record.id} found in records but not registered`);
        continue;
      }

      await this.rollbackMigration(record.id);
      rolledBack++;

      if (targetId && record.id === targetId) {
        break;
      }
    }

    return { rolledBack };
  }

  async createBackup(tableName: string): Promise<string> {
    const timestamp = Date.now();
    const backupTableName = `${tableName}_backup_${timestamp}`;

    await prisma.$queryRaw`
      CREATE TABLE "${backupTableName}" AS TABLE "${tableName}";
    `;

    console.log(`Created backup of ${tableName} as ${backupTableName}`);
    return backupTableName;
  }

  async restoreFromBackup(backupTableName: string, targetTableName: string) {
    await prisma.$queryRaw`
      DROP TABLE IF EXISTS "${targetTableName}";
    `;

    await prisma.$queryRaw`
      ALTER TABLE "${backupTableName}" RENAME TO "${targetTableName}";
    `;

    console.log(`Restored ${targetTableName} from backup ${backupTableName}`);
  }

  async listBackups(): Promise<string[]> {
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE tablename LIKE '%_backup_%'
      ORDER BY tablename DESC;
    `;

    return result.map(r => r.tablename);
  }

  async cleanupOldBackups(keepDays: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const backups = await this.listBackups();
    let cleaned = 0;

    for (const backup of backups) {
      const match = backup.match(/_backup_(\d+)$/);
      if (match) {
        const timestamp = parseInt(match[1]);
        const backupDate = new Date(timestamp);

        if (backupDate < cutoffDate) {
          await prisma.$queryRaw`DROP TABLE IF EXISTS "${backup}"`;
          console.log(`Cleaned up old backup: ${backup}`);
          cleaned++;
        }
      }
    }

    return { cleaned };
  }

  async getStatus() {
    const all = Array.from(this.migrations.values())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const executed = await this.getExecutedMigrations();
    const executedIds = new Set(executed.map(r => r.id));

    return {
      total: all.length,
      executed: executed.length,
      pending: all.length - executed.length,
      migrations: all.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        executed: executedIds.has(m.id),
        executedAt: executed.find(r => r.id === m.id)?.executedAt,
      })),
    };
  }

  async initializeMigrations() {
    await this.ensureMigrationTable();
    await this.registerDefaultMigrations();
  }

  private async registerDefaultMigrations() {
    this.registerMigration({
      id: 'm001_add_project_member_roles',
      name: 'Add Project Member Roles',
      description: 'Update project members table to support additional roles',
      up: async () => {
        await prisma.$queryRaw`
          ALTER TABLE "ProjectMember" DROP CONSTRAINT IF EXISTS "ProjectMember_role_check";
        `;

        await prisma.$queryRaw`
          ALTER TABLE "ProjectMember" 
          ADD CONSTRAINT "ProjectMember_role_check" 
          CHECK ("role" IN ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER'));
        `;
      },
      down: async () => {
        await prisma.$queryRaw`
          ALTER TABLE "ProjectMember" DROP CONSTRAINT IF EXISTS "ProjectMember_role_check";
        `;

        await prisma.$queryRaw`
          ALTER TABLE "ProjectMember" 
          ADD CONSTRAINT "ProjectMember_role_check" 
          CHECK ("role" IN ('OWNER', 'EDITOR', 'VIEWER'));
        `;
      },
    });

    this.registerMigration({
      id: 'm002_add_document_indexes',
      name: 'Add Document Indexes',
      description: 'Add performance indexes for documents table',
      up: async () => {
        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "Document_projectId_type_idx" 
          ON "Document"("projectId", "type");
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "Document_projectId_status_idx" 
          ON "Document"("projectId", "status");
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "Document_projectId_createdAt_idx" 
          ON "Document"("projectId", "createdAt" DESC);
        `;
      },
      down: async () => {
        await prisma.$queryRaw`
          DROP INDEX IF EXISTS "Document_projectId_type_idx";
        `;

        await prisma.$queryRaw`
          DROP INDEX IF EXISTS "Document_projectId_status_idx";
        `;

        await prisma.$queryRaw`
          DROP INDEX IF EXISTS "Document_projectId_createdAt_idx";
        `;
      },
    });

    this.registerMigration({
      id: 'm003_add_shot_generation_stats',
      name: 'Add Shot Generation Stats',
      description: 'Add statistics tracking for shot generations',
      up: async () => {
        await prisma.$queryRaw`
          ALTER TABLE "Shot" 
          ADD COLUMN IF NOT EXISTS "generationCount" INTEGER DEFAULT 0;
        `;

        await prisma.$queryRaw`
          ALTER TABLE "Shot" 
          ADD COLUMN IF NOT EXISTS "lastGeneratedAt" TIMESTAMP(3);
        `;

        await prisma.$queryRaw`
          ALTER TABLE "Shot" 
          ADD COLUMN IF NOT EXISTS "averageGenerationTime" DOUBLE PRECISION;
        `;
      },
      down: async () => {
        await prisma.$queryRaw`
          ALTER TABLE "Shot" DROP COLUMN IF EXISTS "generationCount";
        `;

        await prisma.$queryRaw`
          ALTER TABLE "Shot" DROP COLUMN IF EXISTS "lastGeneratedAt";
        `;

        await prisma.$queryRaw`
          ALTER TABLE "Shot" DROP COLUMN IF EXISTS "averageGenerationTime";
        `;
      },
    });

    this.registerMigration({
      id: 'm004_add_user_activity_tracking',
      name: 'Add User Activity Tracking',
      description: 'Track user activity for analytics',
      up: async () => {
        await prisma.$queryRaw`
          CREATE TABLE IF NOT EXISTS "UserActivity" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "resourceType" TEXT,
            "resourceId" TEXT,
            "metadata" JSONB,
            "ipAddress" TEXT,
            "userAgent" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
          );
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "UserActivity_userId_createdAt_idx" 
          ON "UserActivity"("userId", "createdAt" DESC);
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "UserActivity_action_createdAt_idx" 
          ON "UserActivity"("action", "createdAt" DESC);
        `;
      },
      down: async () => {
        await prisma.$queryRaw`
          DROP TABLE IF EXISTS "UserActivity";
        `;
      },
    });

    this.registerMigration({
      id: 'm005_add_api_rate_limiting',
      name: 'Add API Rate Limiting',
      description: 'Add rate limiting for API endpoints',
      up: async () => {
        await prisma.$queryRaw`
          CREATE TABLE IF NOT EXISTS "RateLimit" (
            "id" TEXT NOT NULL,
            "identifier" TEXT NOT NULL,
            "endpoint" TEXT NOT NULL,
            "requestCount" INTEGER NOT NULL DEFAULT 0,
            "windowStart" TIMESTAMP(3) NOT NULL,
            "blockedUntil" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
          );
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "RateLimit_identifier_endpoint_idx" 
          ON "RateLimit"("identifier", "endpoint");
        `;

        await prisma.$queryRaw`
          CREATE INDEX IF NOT EXISTS "RateLimit_windowStart_idx" 
          ON "RateLimit"("windowStart" DESC);
        `;
      },
      down: async () => {
        await prisma.$queryRaw`
          DROP TABLE IF EXISTS "RateLimit";
        `;
      },
    });
  }
}

export const migrationManager = new MigrationManager();
