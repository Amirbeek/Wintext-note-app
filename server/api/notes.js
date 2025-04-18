import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    try {
        const cookies = parseCookies(event)
        const token =  cookies.AppleNoteJWT;
        if (!token) {
            throw createError({
                statusCode: 401,
                statusMessage: 'No Authorization to access',
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)


        const notes = await prisma.note.findMany({
            where: {
                userId: decodedToken.id,
            }
        });
        return notes
    }catch (e) {
        console.log(e)
    }
})