import { PrismaClient } from '@prisma/client';
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const id = await getRouterParam(event, 'id')

        const cookies = parseCookies(event)
        const token =  cookies.AppleNoteJWT;
        if (!token) {
            throw createError({
                statusCode: 401,
                statusMessage: 'No Authorization to access',
            })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const tryingToUpdate = await  prisma.note.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!tryingToUpdate) {
            throw createError({
                statusCode: 401,
                statusMessage: 'No Authorization to access',
            })
        }
        if (tryingToUpdate.userId !== decodedToken.id){
            throw createError({
                statusCode: 401,
                statusMessage: 'Does not have permission to access',
            })
        }

        await prisma.note.delete({
            where: {
                id: Number(id),
            },
        })
    }
    catch (e) {
        console.log(e)
    }
})