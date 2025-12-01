/*
  Warnings:

  - You are about to drop the `endpoints_controller` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `controllerId` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `endpointId` on the `devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "controllers" ADD COLUMN "tags" JSONB;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "endpoints_controller";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_devices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT,
    "state" TEXT,
    "additionalEndpoints" TEXT,
    "description" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_devices" ("additionalEndpoints", "config", "createdAt", "description", "id", "isActive", "location", "name", "state", "type", "updatedAt") SELECT "additionalEndpoints", "config", "createdAt", "description", "id", "isActive", "location", "name", "state", "type", "updatedAt" FROM "devices";
DROP TABLE "devices";
ALTER TABLE "new_devices" RENAME TO "devices";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
