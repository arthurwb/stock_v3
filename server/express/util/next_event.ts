import { Prisma, PrismaClient } from '@prisma/client';

export default async function nextEvent(prisma: PrismaClient<Prisma.PrismaClientOptions>) {
    const event = await prisma.tEventQueue.findFirst({
        where: {
            eqComplete: false
        },
        orderBy: {
            eqStartDate: "asc"
        }
    });
    console.log(event)
    return event
}