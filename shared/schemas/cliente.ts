import type { core } from "zod";
import z from "zod";
import { BaseSchema } from "./base";

//.omit() cannot be used on object schemas containing refinements

const VendeOrVendePerAcquistareRefine = (
  form: ClienteCommon,
  ctx: core.$RefinementCtx<core.output<ClienteCommon>>,
) => {
  if (form.vende && form.vende_per_acquistare) {
    ctx.addIssue({
      code: "custom",
      path: ["vende_per_acquistare"],
      message: "validation.clientsMutuallyExclusive",
    });
  }
};

export const ClienteCommonSchema = BaseSchema.extend({
  nome: z.string(),
  cognome: z.string(),
  numero_di_telefono: z.string(),
  email: z.email(),
  acquista: z.boolean(),
  vende: z.boolean(),
  vende_per_acquistare: z.boolean(),
});

export const ClienteSchemaUpdate = ClienteCommonSchema.extend({
  id: z.number(),
}).superRefine(VendeOrVendePerAcquistareRefine);

export const ClienteSchema = ClienteSchemaUpdate;

export const ClienteSchemaCreate = ClienteCommonSchema.superRefine(
  VendeOrVendePerAcquistareRefine,
);

export const ClienteFiltersSchema = ClienteSchemaCreate.extend({
  zona_id: z.number(),
  sort_by: z
    .enum([
      "",
      "piano",
      "cognome",
      "numero_di_camere",
      "email",
      "acquista",
      "vende",
      "vende_per_acquistare",
    ])
    .default(""),
  sort_dir: z.enum(["", "asc", "desc"]).default("asc"),
});

export type ClienteUpdate = z.infer<typeof ClienteSchemaUpdate>;
export type ClienteCreate = z.infer<typeof ClienteSchemaCreate>;
export type ClienteFilters = z.infer<typeof ClienteFiltersSchema>;
export type Cliente = z.infer<typeof ClienteSchema>;
type ClienteCommon = z.infer<typeof ClienteCommonSchema>;
