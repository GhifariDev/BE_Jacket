/*
  Warnings:

  - You are about to drop the column `imageUrls` on the `product` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `imageUrls`,
    ADD COLUMN `discountEnd` DATETIME(3) NULL,
    ADD COLUMN `discountStart` DATETIME(3) NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `originalPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `picture` VARCHAR(191) NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `providerId` VARCHAR(191) NULL;
