/*
  Warnings:

  - You are about to alter the column `token` on the `session` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(240)`.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `session` MODIFY `token` VARCHAR(240) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Session_token_key` ON `Session`(`token`);
