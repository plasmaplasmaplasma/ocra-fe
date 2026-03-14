declare module "#app" {
  interface NuxtApp {
    $ocraApi: typeof $fetch;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $ocraApi: typeof $fetch;
  }
}

export {};
