import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
import validator from 'validator';
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        validator.isEmail('foo@bar.com'); //=> true

        if (!validator.isEmail(body.email)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid email address',
            });
        }

        if (!validator.isStrongPassword(body.password, {
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 0,
            minSymbols: 0,
        })
        ) {
            throw createError({
                statusCode: 400,
                message: 'Password is not minimum 8 characters, please change',
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            }
        });

        // Hashing Password
        const isValid = await bcrypt.compare(body.password, user.password)
        console.log('IsValid', isValid)
        if (!isValid) {
            throw createError({
                statusCode: 400,
                message: 'Username or password is invalid.',
            })
        }
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET_KEY)
        setCookie(event, 'AppleNoteJWT', token)
        return { success: true, message: 'Logged in successfully' };
    }catch(err) {
        if (err instanceof Error && "code" in err && err.code === 'P2002') {
            throw createError({
                statusCode: 409,
                message: 'An email already exists',
            });
        }
        throw err;
    }
});
