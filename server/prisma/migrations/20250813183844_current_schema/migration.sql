/*
  Warnings:

  - Made the column `score` on table `evaluations` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `quiz_attempts` DROP FOREIGN KEY `quiz_attempts_studentId_fkey`;

-- DropIndex
DROP INDEX `quiz_attempts_studentId_quizId_key` ON `quiz_attempts`;

-- AlterTable
ALTER TABLE `evaluations` MODIFY `score` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
