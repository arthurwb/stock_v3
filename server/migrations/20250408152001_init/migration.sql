-- CreateTable
CREATE TABLE `tOptions` (
    `id` VARCHAR(191) NOT NULL,
    `optionName` VARCHAR(191) NOT NULL DEFAULT '',
    `optionDescription` VARCHAR(191) NOT NULL DEFAULT '',
    `optionPrice` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tHistoricalPrices` (
    `id` VARCHAR(191) NOT NULL,
    `optionId` VARCHAR(191) NULL,
    `historicalPrice` DECIMAL(10, 2) NOT NULL,
    `historicalPriceStamp` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tHistoricalPrices_optionId_idx`(`optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tUsers` (
    `id` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `userUsername` VARCHAR(191) NOT NULL DEFAULT '',
    `userPassword` VARCHAR(191) NOT NULL,
    `userWallet` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `tUsers_userEmail_key`(`userEmail`),
    UNIQUE INDEX `tUsers_userUsername_key`(`userUsername`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tCarrots` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `optionId` VARCHAR(191) NULL,
    `carrotPurchasePrice` DECIMAL(10, 2) NOT NULL,
    `carrotDatePurchased` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tCarrots_userId_idx`(`userId`),
    INDEX `tCarrots_optionId_idx`(`optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tUserQueue` (
    `id` VARCHAR(191) NOT NULL,
    `uqType` VARCHAR(191) NOT NULL DEFAULT '',
    `uqOptionId` VARCHAR(191) NULL,
    `uqUserId` VARCHAR(191) NULL,
    `uqCount` INTEGER NULL DEFAULT 1,
    `uqTransactionDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uqComplete` BOOLEAN NOT NULL DEFAULT false,

    INDEX `tUserQueue_uqOptionId_idx`(`uqOptionId`),
    INDEX `tUserQueue_uqUserId_idx`(`uqUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tHistoricalPrices` ADD CONSTRAINT `tHistoricalPrices_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `tOptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tCarrots` ADD CONSTRAINT `tCarrots_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `tUsers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tCarrots` ADD CONSTRAINT `tCarrots_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `tOptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tUserQueue` ADD CONSTRAINT `tUserQueue_uqOptionId_fkey` FOREIGN KEY (`uqOptionId`) REFERENCES `tOptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tUserQueue` ADD CONSTRAINT `tUserQueue_uqUserId_fkey` FOREIGN KEY (`uqUserId`) REFERENCES `tUsers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
