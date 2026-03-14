import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-auth-utils", "shadcn-nuxt", "@nuxtjs/i18n", "@nuxt/eslint"],
  i18n: {
    defaultLocale: "it",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    langDir: "locales",
    locales: [
      { code: "it", name: "Italiano", file: "it.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
  },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    optimizeDeps: {
      include: [
        "@iconify/vue",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "lucide-vue-next",
        "vue-sonner",
        "@vueuse/core",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "reka-ui",
        "@tanstack/vue-table",
        "zod",
      ],
    },
    plugins: [tailwindcss()],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
  runtimeConfig: {
    public: {
      ocraApiUrl: process.env.OCRA_API_URL,
    },
  },
  debug: true,
  typescript: {
    typeCheck: true,
  },
});
