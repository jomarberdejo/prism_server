/*
  Warnings:

  - Added the required column `approvedBudget` to the `PPA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budgetAllocation` to the `PPA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ppa` ADD COLUMN `actualOutput` VARCHAR(191) NULL,
    ADD COLUMN `approvedBudget` VARCHAR(191) NOT NULL,
    ADD COLUMN `budgetAllocation` VARCHAR(191) NOT NULL;
