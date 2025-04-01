import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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

        const newNote = await prisma.note.create({
            data: {
                text: '<p>Please write note...<p>',
                userId: decodedToken.id
            }
        })
        return newNote
    } catch (e) {
        console.log(e)
        throw createError({
            statusCode: 500,
            statusMessage: 'Does not have permission to access',
        })
    }
})