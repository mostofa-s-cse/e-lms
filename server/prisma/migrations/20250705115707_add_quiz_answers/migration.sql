/*
  Warnings:

  - You are about to drop the column `fileSize` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `courses` ADD COLUMN `isFree` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `price` DOUBLE NULL DEFAULT 0.0,
    ADD COLUMN `thumbnail` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `intakes` ADD COLUMN `amount` DOUBLE NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `notes` DROP COLUMN `fileSize`,
    DROP COLUMN `fileType`,
    DROP COLUMN `fileUrl`,
    ADD COLUMN `attachment` VARCHAR(191) NULL,
    ADD COLUMN `attachmentSize` INTEGER NULL,
    ADD COLUMN `attachmentType` VARCHAR(191) NULL,
    ADD COLUMN `isImage` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `profilePicture` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_answers` (
    `id` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `marksEarned` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `attemptId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `quiz_answers_attemptId_questionId_key`(`attemptId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
