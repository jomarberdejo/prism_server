-- AlterTable
ALTER TABLE `ppa` MODIFY `description` TEXT NOT NULL,
    MODIFY `budgetAllocation` TEXT NULL,
    MODIFY `expectedOutput` TEXT NOT NULL,
    MODIFY `actualOutput` TEXT NULL,
    MODIFY `remarks` TEXT NULL,
    MODIFY `delayedReason` TEXT NULL;

-- AlterTable
ALTER TABLE `sector` MODIFY `description` TEXT NULL;
