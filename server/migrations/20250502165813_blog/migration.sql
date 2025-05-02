-- CreateTable
CREATE TABLE `tBlog` (
    `id` VARCHAR(191) NOT NULL,
    `bTitle` VARCHAR(191) NOT NULL DEFAULT '',
    `bSubTitle` VARCHAR(191) NOT NULL DEFAULT '',
    `bContent` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
