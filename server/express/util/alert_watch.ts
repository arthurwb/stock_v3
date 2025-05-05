import type { Context } from ".keystone/types";
import { Decimal } from "@keystone-6/core/types";

type Market = {
    id: string;
    mName: string;
    mType: string;
    mActiveEvent: string;
  };
  
  type Option = {
    id: string;
    optionName: string;
    optionShort: string;
    optionDescription: string;
    optionPrice: Decimal;
    optionBankruptcy: boolean;
  };

export async function alert_watch(
    context: Context,
    prevMarket: Market | null,
    prevOptions: Option[]
  ): Promise<[boolean, string[], Market | null, Option[]]> {
    let changeFlag = false;
    let changeValues: string[] = [];
  
    const currentMarket = await context.prisma.tMarket.findFirst({
      where: { mName: "current" }
    });
  
    let returnMarket: Market | null = null;
    let returnOptions: Option[] = [];
  
    if (currentMarket?.mType === prevMarket?.mType) {
      returnMarket = prevMarket;
    } else {
      changeValues.push("New market: " + currentMarket?.mType);
      changeFlag = true;
      returnMarket = currentMarket;
    }
  
    for (const prevOption of prevOptions) {
      const option = await context.prisma.tOptions.findFirst({
        where: { id: prevOption.id }
      });
  
      if (!option) continue;
  
      if (prevOption.optionBankruptcy && !option.optionBankruptcy) {
        changeFlag = true;
        changeValues.push("Buyout!: " + option.optionName);
      } else if (!prevOption.optionBankruptcy && option.optionBankruptcy) {
        changeFlag = true;
        changeValues.push("Bankrupt!: " + option.optionName);
      }
    }
  
    returnOptions = await context.prisma.tOptions.findMany();
  
    return [changeFlag, changeValues, returnMarket, returnOptions];
  }
  