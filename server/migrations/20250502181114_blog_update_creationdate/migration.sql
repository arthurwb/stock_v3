/*
  Warnings:

  - You are about to drop the column `eqCreationDate` on the `tBlog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tBlog` DROP COLUMN `eqCreationDate`,
    ADD COLUMN `bCreationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
