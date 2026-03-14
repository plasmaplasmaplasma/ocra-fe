import type { UseFetchOptions } from "@vueuse/core";

export function useOcraFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions & Record<string, unknown> = {},
) {
  const { $ocraApi } = useNuxtApp();

  return useFetch<T>(url, {
    ...options,
    $fetch: $ocraApi as typeof $fetch,
  });
}
