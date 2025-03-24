import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import {
  text,
  integer,
  relationship,
  password,
  timestamp,
  decimal,
  checkbox,
} from '@keystone-6/core/fields';
export const lists = {
  tOptions: list({
    access: allowAll,
    graphql: {
      plural: 'OptionsList',
    },
    fields: {
      optionName: text({ validation: { isRequired: true } }),
      optionDescription: text({ validation: { isRequired: true } }),
      optionPrice: decimal({ precision: 10, scale: 2, validation: { isRequired: true } }),
      historicalPrices: relationship({ ref: 'tHistoricalPrices.optionId', many: true }),
      optionCarrots: relationship({ ref: 'tCarrots.optionId', many: true }),
      userQueue: relationship({ ref: 'tUserQueue.uqOptionId', many: true }),
    },
  }),
  tHistoricalPrices: list({
    access: allowAll,
    graphql: {
      plural: 'HistoricalPricesList',
    },
    fields: {
      optionId: relationship({ ref: 'tOptions.historicalPrices' }),
      historicalPrice: decimal({ precision: 10, scale: 2, validation: { isRequired: true } }),
      historicalPriceStamp: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
  tUsers: list({
    access: allowAll,
    graphql: {
      plural: 'UsersList',
    },
    fields: {
      userEmail: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      userUsername: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      userPassword: password({ validation: { isRequired: true } }),
      userWallet: decimal({ precision: 10, scale: 2, validation: { isRequired: true } }),
      userCarrots: relationship({ ref: 'tCarrots.userId', many: true }),
      userQueue: relationship({ ref: 'tUserQueue.uqUserId', many: true }),
    },
  }),
  tCarrots: list({
    access: allowAll,
    graphql: {
      plural: 'CarrotsList',
    },
    fields: {
      userId: relationship({ ref: 'tUsers.userCarrots' }),
      optionId: relationship({ ref: 'tOptions.optionCarrots' }),
      carrotPurchasePrice: decimal({ precision: 10, scale: 2, validation: { isRequired: true } }),
      carrotDatePurchased: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
  tUserQueue: list({
    access: allowAll,
    graphql: {
      plural: 'UserQueueList',
    },
    fields: {
      uqType: text({ validation: { isRequired: true } }),
      uqOptionId: relationship({
        ref: 'tOptions.userQueue'
      }),
      uqUserId: relationship({
        ref: 'tUsers.userQueue'
      }),
      uqPurchaseCount: integer({
        defaultValue: 1
      }),
      uqDatePurchased: timestamp({
        defaultValue: { kind: 'now' },
      }),
      uqComplete: checkbox({
        defaultValue: false
      }),
    }
  })
};