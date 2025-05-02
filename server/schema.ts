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
  calendarDay,
} from '@keystone-6/core/fields';
export const lists = {
  tOptions: list({
    access: allowAll,
    graphql: {
      plural: 'OptionsList',
    },
    fields: {
      optionName: text({ validation: { isRequired: true } }),
      optionShort: text({ validation: { isRequired: true } }),
      optionDescription: text({ validation: { isRequired: true } }),
      optionPrice: decimal({ precision: 10, scale: 2, validation: { isRequired: true } }),
      historicalPrices: relationship({ ref: 'tHistoricalPrices.optionId', many: true }),
      optionCarrots: relationship({ ref: 'tCarrots.optionId', many: true }),
      userQueue: relationship({ ref: 'tUserQueue.uqOptionId', many: true }),
      eventQueue: relationship({ ref: 'tEventQueue.eqEfectedOptionIds', many: true }),
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
      uqCount: integer({
        defaultValue: 1
      }),
      uqTransactionDate: timestamp({
        defaultValue: { kind: 'now' },
      }),
      uqComplete: checkbox({
        defaultValue: false
      }),
    }
  }),
  tEventQueue: list({
    access: allowAll,
    graphql: {
      plural: 'EventQueueList',
    },
    fields: {
      eqType: text({ validation: { isRequired: true } }),
      eqEffects: text({ validation: { isRequired: true } }),
      eqEfectedOptionIds: relationship({
        ref: 'tOptions.eventQueue',
        many: true,
      }),
      eqStartDate: timestamp({ validation: { isRequired: true } }),
      eqCreationData: timestamp({ 
        validation: { isRequired: true },
        defaultValue: { kind: 'now' },
      }),
      eqComplete: checkbox({
        defaultValue: false
      }),
    }
  }),
  tMarket: list({
    access: allowAll,
    graphql: {
      plural: 'MarketList',
    },
    fields: {
      mName: text({ validation: { isRequired: true }}),
      mType: text({ validation: { isRequired: true }}),
      mActiveEvent: text({ validation: { isRequired: false }}),
    }
  }),
  tBlog: list({
    access: allowAll,
    graphql: {
      plural: "BlogList",
    },
    fields: {
      bTitle: text({ validation: { isRequired: true }}),
      bSubTitle: text(),
      bContent: text({ validation: { isRequired: true }}),
    }
  })
};