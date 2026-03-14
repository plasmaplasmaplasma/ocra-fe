import type { UserSession } from "../../shared/types/user";
import type { ApiEnvelope } from "../../shared/types/api";
import { loginCredentialsSchema } from "../../shared/schemas/auth";

type RawUserSession = {
  id?: number;
  email?: string;
  username?: string;
  ID?: number;
  Email?: string;
  Username?: string;
};

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, loginCredentialsSchema.parse);

  const config = useRuntimeConfig();
  const apiUrl = config.public.ocraApiUrl;

  try {
    const response = await $fetch<ApiEnvelope<RawUserSession>>(`${apiUrl}/users/login`, {
      method: "POST",
      body: { email, password },
    });

    if (!response.status || !response.data) {
      throw new Error(response.error || "Bad credentials");
    }

    const user: UserSession = {
      id: response.data.id ?? response.data.ID ?? 0,
      email: response.data.email ?? response.data.Email ?? "",
      username: response.data.username ?? response.data.Username ?? "",
    };

    await setUserSession(event, {
      user,
    });
    return user;
  } catch {
    throw createError({
      status: 401,
      message: "Bad credentials",
    });
  }
});
