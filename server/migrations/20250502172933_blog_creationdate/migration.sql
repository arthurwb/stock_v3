/*
  Warnings:

  - You are about to drop the column `eqCreationData` on the `tEventQueue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tBlog` ADD COLUMN `eqCreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `tEventQueue` DROP COLUMN `eqCreationData`,
    ADD COLUMN `eqCreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
