import { z } from "zod";
import { BaseSchema } from "./base";

export const ZonaSchemaUpdate = BaseSchema.extend({
  nome: z.string(),
  id: z.number(),
});

export const ZonaSchema = ZonaSchemaUpdate;

export const ZonaSchemaCreate = ZonaSchemaUpdate.omit({
  id: true,
});

export const ZonaSchemaFilter = ZonaSchemaCreate.extend({
  sort_by: z.enum(["", "nome"]).default(""),
  sort_dir: z.enum(["", "asc", "desc"]).default("asc"),
});

export type ZonaUpdate = z.infer<typeof ZonaSchemaUpdate>;
export type ZonaCreate = z.infer<typeof ZonaSchemaCreate>;
export type Zona = z.infer<typeof ZonaSchema>;
