/*
  Warnings:

  - You are about to drop the column `attendees` on the `ppa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ppa` DROP COLUMN `attendees`;

-- CreateTable
CREATE TABLE `_PPAAttendees` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PPAAttendees_AB_unique`(`A`, `B`),
    INDEX `_PPAAttendees_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PPAAttendees` ADD CONSTRAINT `_PPAAttendees_A_fkey` FOREIGN KEY (`A`) REFERENCES `PPA`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PPAAttendees` ADD CONSTRAINT `_PPAAttendees_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
