/*
  Warnings:

  - You are about to drop the column `isConnected` on the `controllers` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `controllers` table. All the data in the column will be lost.
  - You are about to alter the column `configs` on the `controllers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_controllers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "configs" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_controllers" ("configs", "createdAt", "driver", "id", "name", "updatedAt") SELECT "configs", "createdAt", "driver", "id", "name", "updatedAt" FROM "controllers";
DROP TABLE "controllers";
ALTER TABLE "new_controllers" RENAME TO "controllers";
CREATE UNIQUE INDEX "controllers_name_key" ON "controllers"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
