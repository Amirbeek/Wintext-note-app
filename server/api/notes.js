import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const notes = await prisma.note.findMany();
        return notes
    }catch (e) {
        console.log(e)
    }
})