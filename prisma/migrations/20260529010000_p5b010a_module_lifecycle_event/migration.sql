-- CreateTable
CREATE TABLE "ModuleLifecycleEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "module_key" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "action_key" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "evidence_ref" TEXT,
    "reason" TEXT,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleLifecycleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleLifecycleEvent_module_key_to_status_created_at_idx" ON "ModuleLifecycleEvent"("module_key", "to_status", "created_at");

-- CreateIndex
CREATE INDEX "ModuleLifecycleEvent_organization_id_module_key_created_at_idx" ON "ModuleLifecycleEvent"("organization_id", "module_key", "created_at");

-- CreateIndex
CREATE INDEX "ModuleLifecycleEvent_organization_id_actor_user_id_created__idx" ON "ModuleLifecycleEvent"("organization_id", "actor_user_id", "created_at");

-- CreateIndex
CREATE INDEX "ModuleLifecycleEvent_action_key_created_at_idx" ON "ModuleLifecycleEvent"("action_key", "created_at");

-- CreateIndex
CREATE INDEX "ModuleRegistryEntry_version_idx" ON "ModuleRegistryEntry"("version");

-- CreateIndex
CREATE INDEX "ModuleRegistryEntry_status_version_idx" ON "ModuleRegistryEntry"("status", "version");

-- AddForeignKey
ALTER TABLE "ModuleLifecycleEvent" ADD CONSTRAINT "ModuleLifecycleEvent_module_key_fkey" FOREIGN KEY ("module_key") REFERENCES "ModuleRegistryEntry"("module_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleLifecycleEvent" ADD CONSTRAINT "ModuleLifecycleEvent_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleLifecycleEvent" ADD CONSTRAINT "ModuleLifecycleEvent_organization_id_actor_user_id_fkey" FOREIGN KEY ("organization_id", "actor_user_id") REFERENCES "User"("organization_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

