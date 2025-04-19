-- CreateTable
CREATE TABLE `tEventQueue` (
    `id` VARCHAR(191) NOT NULL,
    `eqType` VARCHAR(191) NOT NULL DEFAULT '',
    `eqEffects` VARCHAR(191) NOT NULL DEFAULT '',
    `eqStartDate` DATETIME(3) NOT NULL,
    `eqCreationData` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eqComplete` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tMarket` (
    `id` VARCHAR(191) NOT NULL,
    `mName` VARCHAR(191) NOT NULL DEFAULT '',
    `mType` VARCHAR(191) NOT NULL DEFAULT '',
    `mActiveEvent` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_tEventQueue_eqEfectedOptionIds` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_tEventQueue_eqEfectedOptionIds_AB_unique`(`A`, `B`),
    INDEX `_tEventQueue_eqEfectedOptionIds_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_tEventQueue_eqEfectedOptionIds` ADD CONSTRAINT `_tEventQueue_eqEfectedOptionIds_A_fkey` FOREIGN KEY (`A`) REFERENCES `tEventQueue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_tEventQueue_eqEfectedOptionIds` ADD CONSTRAINT `_tEventQueue_eqEfectedOptionIds_B_fkey` FOREIGN KEY (`B`) REFERENCES `tOptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
