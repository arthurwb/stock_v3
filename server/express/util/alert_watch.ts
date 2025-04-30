import type { Context } from ".keystone/types";

export async function alert_watch(context: Context, prevMarket: any) {
    prevMarket = await prevMarket
    let changeFlag = false;
    let changeValue: any;

    const currentMarket = await context.prisma.tMarket.findFirst({
        where: {
            mName: "current"
        }
    });

    if (currentMarket?.mType == prevMarket?.mType) {
        return [changeFlag, "", prevMarket];
    } else {
        changeValue = currentMarket?.mType;
        changeFlag = true;
    }

    return [changeFlag, changeValue, currentMarket]
}