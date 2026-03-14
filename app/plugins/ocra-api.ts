export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const ocraApi = $fetch.create({
    baseURL: config.public.ocraApiUrl,
  });

  return {
    provide: {
      ocraApi,
    },
  };
});
