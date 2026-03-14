import type { ApiEnvelope, QueryValue } from "../../shared/types/api";

type QueryParams = Record<string, QueryValue>;

function assertSuccess<T>(response: ApiEnvelope<T>): ApiEnvelope<T> {
  if (!response.status) {
    throw createError({
      statusCode: 400,
      statusMessage: response.error || "Request failed",
    });
  }
  return response;
}

export function useOcraCrud(resourcePath: string) {
  const { $ocraApi } = useNuxtApp();

  const create = async <TEntity>(payload: Record<string, unknown>) => {
    const response = await $ocraApi<ApiEnvelope<TEntity>>(`${resourcePath}/create`, {
      method: "POST",
      body: payload,
    });
    return assertSuccess(response);
  };

  const update = async <TEntity>(id: number, payload: Record<string, unknown>) => {
    const response = await $ocraApi<ApiEnvelope<TEntity>>(`${resourcePath}/update/${id}`, {
      method: "PUT",
      body: payload,
    });
    return assertSuccess(response);
  };

  const remove = async (id: number) => {
    const response = await $ocraApi<ApiEnvelope<null>>(`${resourcePath}/delete/${id}`, {
      method: "DELETE",
    });
    return assertSuccess(response);
  };

  const read = async <TEntity>(params: QueryParams = {}) => {
    const response = await $ocraApi<ApiEnvelope<TEntity>>(`${resourcePath}/read`, {
      method: "GET",
      query: params,
    });
    return assertSuccess(response);
  };

  return {
    create,
    update,
    remove,
    read,
  };
}
