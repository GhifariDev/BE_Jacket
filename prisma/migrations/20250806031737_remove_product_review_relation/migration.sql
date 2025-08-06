/*
  Warnings:

  - You are about to drop the column `productId` on the `review` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_productId_fkey`;

-- DropIndex
DROP INDEX `Review_productId_fkey` ON `review`;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `productId`;
