/*
  Warnings:

  - You are about to drop the column `dueTime` on the `ppa` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `ppa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ppa` DROP COLUMN `dueTime`,
    DROP COLUMN `startTime`;
