/*
  Warnings:

  - Added the required column `courseId` to the `evaluations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- First add the column as nullable
ALTER TABLE `evaluations` ADD COLUMN `courseId` VARCHAR(191) NULL;

-- Update existing evaluations to use the first available course
UPDATE `evaluations` SET `courseId` = (SELECT `id` FROM `courses` LIMIT 1) WHERE `courseId` IS NULL;

-- Make the column required
ALTER TABLE `evaluations` MODIFY COLUMN `courseId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
