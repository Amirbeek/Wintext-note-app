// https://nuxt.com/docs/api/configuration/nuxt-config
import autoprefixer from "autoprefixer";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/main.css'],

  postcss: {
    plugins: {
      tailwindcss:{},
      autoprefixer:{}
    },
  },

  modules: ['@prisma/nuxt'],
})