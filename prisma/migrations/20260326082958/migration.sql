-- DropForeignKey
ALTER TABLE `implementingunit` DROP FOREIGN KEY `ImplementingUnit_userId_fkey`;

-- AlterTable
ALTER TABLE `implementingunit` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ImplementingUnit` ADD CONSTRAINT `ImplementingUnit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
