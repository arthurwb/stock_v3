import { Decimal } from '@keystone-6/core/types';

export type Option = {
    id: string;
    optionName: string;
    optionPrice: Decimal;
}
export type User = {
    id: string;
    userUsername: string;
    userPassword: string;
    userWallet: Decimal;
}
export type HistoricalPrice = {
    optionId: string,
    historicalPrice: Decimal,
    historicalPriceStamp: Date
}
export type Carrot = {
    userId: string;
    optionId: string;
    carrotPurchasePrice: Decimal;
    carrotDatePurchased: Date;
}