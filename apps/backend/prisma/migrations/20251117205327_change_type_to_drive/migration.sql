/*
  Warnings:

  - You are about to drop the column `type` on the `controllers` table. All the data in the column will be lost.
  - Added the required column `driver` to the `controllers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_controllers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "configs" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_controllers" ("configs", "createdAt", "id", "isConnected", "lastSeen", "name", "updatedAt") SELECT "configs", "createdAt", "id", "isConnected", "lastSeen", "name", "updatedAt" FROM "controllers";
DROP TABLE "controllers";
ALTER TABLE "new_controllers" RENAME TO "controllers";
CREATE UNIQUE INDEX "controllers_name_key" ON "controllers"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
