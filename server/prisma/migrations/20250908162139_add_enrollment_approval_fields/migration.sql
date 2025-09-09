-- AlterTable
ALTER TABLE `enrollments` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    MODIFY `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'DROPPED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
