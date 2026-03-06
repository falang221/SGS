/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,name]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "attendance_enrollmentId_date_idx";

-- DropIndex
DROP INDEX "enrollments_studentId_yearId_idx";

-- DropIndex
DROP INDEX "grades_enrollmentId_idx";

-- DropIndex
DROP INDEX "payments_enrollmentId_idx";

-- DropIndex
DROP INDEX "schools_tenantId_idx";

-- DropIndex
DROP INDEX "students_schoolId_idx";

-- DropIndex
DROP INDEX "timetable_entries_classId_dayOfWeek_idx";

-- DropIndex
DROP INDEX "timetable_entries_staffId_dayOfWeek_idx";

-- DropIndex
DROP INDEX "users_tenantId_idx";

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "attendance_enrollmentId_date_deletedAt_idx" ON "attendance"("enrollmentId", "date", "deletedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "classes_schoolId_deletedAt_idx" ON "classes"("schoolId", "deletedAt");

-- CreateIndex
CREATE INDEX "enrollments_studentId_yearId_deletedAt_idx" ON "enrollments"("studentId", "yearId", "deletedAt");

-- CreateIndex
CREATE INDEX "enrollments_classId_yearId_deletedAt_idx" ON "enrollments"("classId", "yearId", "deletedAt");

-- CreateIndex
CREATE INDEX "grades_enrollmentId_subjectId_deletedAt_idx" ON "grades"("enrollmentId", "subjectId", "deletedAt");

-- CreateIndex
CREATE INDEX "payments_enrollmentId_status_deletedAt_idx" ON "payments"("enrollmentId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "schools_tenantId_deletedAt_idx" ON "schools"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "staff_schoolId_deletedAt_idx" ON "staff"("schoolId", "deletedAt");

-- CreateIndex
CREATE INDEX "students_schoolId_deletedAt_idx" ON "students"("schoolId", "deletedAt");

-- CreateIndex
CREATE INDEX "students_matricule_deletedAt_idx" ON "students"("matricule", "deletedAt");

-- CreateIndex
CREATE INDEX "subjects_schoolId_deletedAt_idx" ON "subjects"("schoolId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_schoolId_name_key" ON "subjects"("schoolId", "name");

-- CreateIndex
CREATE INDEX "tenants_slug_deletedAt_idx" ON "tenants"("slug", "deletedAt");

-- CreateIndex
CREATE INDEX "timetable_entries_classId_dayOfWeek_deletedAt_idx" ON "timetable_entries"("classId", "dayOfWeek", "deletedAt");

-- CreateIndex
CREATE INDEX "timetable_entries_staffId_dayOfWeek_deletedAt_idx" ON "timetable_entries"("staffId", "dayOfWeek", "deletedAt");

-- CreateIndex
CREATE INDEX "users_tenantId_deletedAt_idx" ON "users"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "users_email_deletedAt_idx" ON "users"("email", "deletedAt");
