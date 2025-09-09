/*
  Warnings:

  - The values [SUSPENDED] on the enum `enrollments_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `evaluatedAt` on the `evaluations` table. All the data in the column will be lost.
  - The values [PRESENTATION,OTHER] on the enum `evaluations_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [CREDIT_CARD,DEBIT_CARD,MOBILE_BANKING,INTERNET_BANKING,PAYPAL,CASH,OTHER] on the enum `payments_method` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `score` on table `evaluations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `evaluations` DROP FOREIGN KEY `evaluations_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluations` DROP FOREIGN KEY `evaluations_evaluatorId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluations` DROP FOREIGN KEY `evaluations_studentId_fkey`;

-- DropIndex
DROP INDEX `evaluations_courseId_fkey` ON `evaluations`;

-- DropIndex
DROP INDEX `evaluations_evaluatorId_fkey` ON `evaluations`;

-- DropIndex
DROP INDEX `evaluations_studentId_fkey` ON `evaluations`;

-- AlterTable
ALTER TABLE `enrollments` MODIFY `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'DROPPED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `evaluations` DROP COLUMN `evaluatedAt`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `type` ENUM('ASSIGNMENT', 'PROJECT', 'EXAM', 'PARTICIPATION') NOT NULL,
    MODIFY `score` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    MODIFY `method` ENUM('SSLCOMMERZ', 'CUSTOM', 'BANK_TRANSFER') NOT NULL DEFAULT 'SSLCOMMERZ';

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `adminResponse` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
