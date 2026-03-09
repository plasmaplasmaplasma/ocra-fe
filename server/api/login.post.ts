import { z } from "zod";
import { UserSession } from "../../shared/types/user";

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse);

  const config = useRuntimeConfig();
  const apiUrl = config.public.ocraApiUrl;

  try {
    const response = await $fetch<UserSession>(`${apiUrl}/users/login`, {
      method: "POST",
      body: { email, password },
    });
    await setUserSession(event, {
      user: response,
    });
    return response;
  } catch {
    throw createError({
      status: 401,
      message: "Bad credentials",
    });
  }
});
