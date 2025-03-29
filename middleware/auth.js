export default defineNuxtRouteMiddleware(async (event) => {
    if (process.client) return

    const {$verifyJwtToken} = useNuxtApp()
    const jwt = useCookie('AppleNoteJWT')
    if (!jwt.value) {
        return navigateTo('/register')
    }

    try {
        await $verifyJwtToken(jwt.value, process.env.JWT_SECRET_KEY)
    }catch (error) {
        return navigateTo('/register')
    }
})