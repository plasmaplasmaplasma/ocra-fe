import z from "zod";
import { BaseSchema } from "./base";
import { ZonaSchema, ZonaSchemaFilter } from "./zona";

export const CasaSchemaUpdate = BaseSchema.extend({
  id: z.number(),
  piano: z.number(),
  numero_di_locali: z.number().int(),
  numero_di_camere: z.number().int(),
  numero_di_bagni: z.number().int(),
  balcone: z.boolean(),
  terrazzo: z.boolean(),
  giardino: z.boolean(),
  zona_id: z.number(),
});

export const CasaSchema = CasaSchemaUpdate.extend({
    zona: ZonaSchema,
});

export const CasaSchemaCreate = CasaSchemaUpdate.omit({
  id: true,
});

export const CasaFiltersSchema = CasaSchemaCreate.extend({
  sort_by: z
    .enum([
      "",
      "piano",
      "numero_di_locali",
      "numero_di_camere",
      "numero_di_bagni",
    ])
    .default(""),
  sort_dir: z.enum(["", "asc", "desc"]).default("asc"),
});

export type CasaUpdate = z.infer<typeof CasaSchemaUpdate>;
export type CasaCreate = z.infer<typeof CasaSchemaCreate>;
export type CasaFilters = z.infer<typeof CasaFiltersSchema>;
export type Casa = z.infer<typeof CasaSchema>;
