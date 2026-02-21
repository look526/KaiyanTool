-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" UUID NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "current_step_id" TEXT,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "estimated_duration" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTutorial" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "chapters" JSONB NOT NULL DEFAULT '[]',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "related_tutorials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialProgress" (
    "id" UUID NOT NULL,
    "tutorial_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "watched_duration" INTEGER NOT NULL DEFAULT 0,
    "last_watched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorialProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TutorialRating" (
    "id" UUID NOT NULL,
    "tutorial_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorialRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRecord" (
    "id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderTask" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "params" JSONB NOT NULL DEFAULT '{}',
    "project_id" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error" TEXT,
    "logs" JSONB DEFAULT '[]',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backup" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "backup_id" TEXT NOT NULL,
    "description" TEXT,
    "size" BIGINT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupSchedule" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "frequency" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "include_assets" BOOLEAN NOT NULL DEFAULT true,
    "retention_days" INTEGER NOT NULL DEFAULT 30,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackupSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrationLog" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "result" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MigrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "entry_point" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "settings" JSONB DEFAULT '{}',
    "manifest" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "installations" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPlugin" (
    "id" UUID NOT NULL,
    "plugin_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "installed_by" UUID NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPlugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "project_id" UUID NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "snapshot" JSONB NOT NULL,
    "parent_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneConcept" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "time_of_day" TEXT,
    "atmosphere" TEXT,
    "reference_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SceneConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptAnalysis" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "characters" JSONB NOT NULL DEFAULT '[]',
    "plotPoints" JSONB NOT NULL DEFAULT '[]',
    "sentiment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScriptAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualPrompt" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "shot_id" UUID,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "style" TEXT,
    "parameters" JSONB DEFAULT '{}',
    "result" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowExecution_project_id_idx" ON "WorkflowExecution"("project_id");

-- CreateIndex
CREATE INDEX "WorkflowExecution_user_id_idx" ON "WorkflowExecution"("user_id");

-- CreateIndex
CREATE INDEX "WorkflowExecution_status_idx" ON "WorkflowExecution"("status");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_category_idx" ON "WorkflowTemplate"("category");

-- CreateIndex
CREATE INDEX "VideoTutorial_category_idx" ON "VideoTutorial"("category");

-- CreateIndex
CREATE INDEX "VideoTutorial_level_idx" ON "VideoTutorial"("level");

-- CreateIndex
CREATE INDEX "TutorialProgress_user_id_idx" ON "TutorialProgress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialProgress_tutorial_id_user_id_key" ON "TutorialProgress"("tutorial_id", "user_id");

-- CreateIndex
CREATE INDEX "TutorialRating_tutorial_id_idx" ON "TutorialRating"("tutorial_id");

-- CreateIndex
CREATE UNIQUE INDEX "TutorialRating_tutorial_id_user_id_key" ON "TutorialRating"("tutorial_id", "user_id");

-- CreateIndex
CREATE INDEX "AlertRule_metric_idx" ON "AlertRule"("metric");

-- CreateIndex
CREATE INDEX "AlertRule_enabled_idx" ON "AlertRule"("enabled");

-- CreateIndex
CREATE INDEX "AlertRecord_rule_id_idx" ON "AlertRecord"("rule_id");

-- CreateIndex
CREATE INDEX "AlertRecord_severity_idx" ON "AlertRecord"("severity");

-- CreateIndex
CREATE INDEX "AlertRecord_created_at_idx" ON "AlertRecord"("created_at");

-- CreateIndex
CREATE INDEX "Metrics_name_idx" ON "Metrics"("name");

-- CreateIndex
CREATE INDEX "Metrics_timestamp_idx" ON "Metrics"("timestamp");

-- CreateIndex
CREATE INDEX "RenderTask_project_id_idx" ON "RenderTask"("project_id");

-- CreateIndex
CREATE INDEX "RenderTask_status_idx" ON "RenderTask"("status");

-- CreateIndex
CREATE INDEX "RenderTask_type_idx" ON "RenderTask"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Backup_backup_id_key" ON "Backup"("backup_id");

-- CreateIndex
CREATE INDEX "Backup_project_id_idx" ON "Backup"("project_id");

-- CreateIndex
CREATE INDEX "Backup_created_at_idx" ON "Backup"("created_at");

-- CreateIndex
CREATE INDEX "BackupSchedule_project_id_idx" ON "BackupSchedule"("project_id");

-- CreateIndex
CREATE INDEX "BackupSchedule_enabled_idx" ON "BackupSchedule"("enabled");

-- CreateIndex
CREATE INDEX "MigrationLog_user_id_idx" ON "MigrationLog"("user_id");

-- CreateIndex
CREATE INDEX "MigrationLog_source_idx" ON "MigrationLog"("source");

-- CreateIndex
CREATE INDEX "MigrationLog_timestamp_idx" ON "MigrationLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_name_key" ON "Plugin"("name");

-- CreateIndex
CREATE INDEX "Plugin_status_idx" ON "Plugin"("status");

-- CreateIndex
CREATE INDEX "Plugin_is_public_idx" ON "Plugin"("is_public");

-- CreateIndex
CREATE INDEX "ProjectPlugin_project_id_idx" ON "ProjectPlugin"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPlugin_plugin_id_project_id_key" ON "ProjectPlugin"("plugin_id", "project_id");

-- CreateIndex
CREATE INDEX "ProjectTemplate_category_idx" ON "ProjectTemplate"("category");

-- CreateIndex
CREATE INDEX "ProjectTemplate_created_by_idx" ON "ProjectTemplate"("created_by");

-- CreateIndex
CREATE INDEX "Asset_project_id_idx" ON "Asset"("project_id");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "ProjectVersion_project_id_idx" ON "ProjectVersion"("project_id");

-- CreateIndex
CREATE INDEX "ProjectVersion_parent_id_idx" ON "ProjectVersion"("parent_id");

-- CreateIndex
CREATE INDEX "ProjectVersion_created_by_idx" ON "ProjectVersion"("created_by");

-- CreateIndex
CREATE INDEX "SceneConcept_project_id_idx" ON "SceneConcept"("project_id");

-- CreateIndex
CREATE INDEX "ScriptAnalysis_project_id_idx" ON "ScriptAnalysis"("project_id");

-- CreateIndex
CREATE INDEX "VisualPrompt_project_id_idx" ON "VisualPrompt"("project_id");

-- CreateIndex
CREATE INDEX "VisualPrompt_shot_id_idx" ON "VisualPrompt"("shot_id");
