import z from "zod";
import { BaseSchema } from "./base";
import { CasaFiltersSchema, CasaSchema } from "./casa";
import { ClienteSchema } from "./cliente";

export const RicercaCasaSchemaUpdate = BaseSchema.extend({
  tempo_di_acquisto: z.number(),
  budget: z.number(),
  percentuale_mutuo: z.number(),
  liquidita: z.number(),
  cliente_id: z.number(),
  casa_id: z.number(),
  id: z.number(),
});

export const RicercaCasaSchemaCreate = RicercaCasaSchemaUpdate.omit({
  id: true,
});

export const RicercaCasaSchema = RicercaCasaSchemaUpdate.extend({
  cliente: ClienteSchema,
  casa: CasaSchema,
});

export const RicercaCasaFilterSchema = CasaFiltersSchema.extend({
  sort_by: z
    .enum(["", "tempo_di_acquisto", "budget", "percentuale_mutuo", "liquidita"])
    .default(""),
  sort_dir: z.enum(["", "asc", "desc"]).default("asc"),
  tempo_di_acquisto_from: z.number(),
  tempo_di_acquisto_to: z.number(),
  budget_from: z.number(),
  budget_to: z.number(),
  percentuale_mutuo_from: z.number(),
  percentuale_mutuo_to: z.number(),
  liquidita_from: z.number(),
  liquidita_to: z.number(),
  cliente_id: z.number(),
  casa_id: z.number(),
});

export type RicercaCasaUpdate = z.infer<typeof RicercaCasaSchemaUpdate>;
export type RicercaCasaCreate = z.infer<typeof RicercaCasaSchemaCreate>;
export type RicercaCasaFilter = z.infer<typeof RicercaCasaFilterSchema>;
export type RicercaCasa = z.infer<typeof RicercaCasaSchema>;
