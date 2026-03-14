export type Zona = {
  id: number;
  nome: string;
};

export type Cliente = {
  id: number;
  nome: string | null;
  cognome: string | null;
  numero_di_telefono: string | null;
  email: string | null;
  acquista: boolean;
  vende: boolean;
  vende_per_acquistare: boolean;
};

export type Casa = {
  id: number;
  piano: number | null;
  numero_di_locali: number | null;
  numero_di_camere: number | null;
  numero_di_bagni: number | null;
  balcone: boolean | null;
  terrazzo: boolean | null;
  giardino: boolean | null;
  zona_id: number;
  zona: Zona;
};

export type RicercaCasa = {
  id: number;
  tempo_di_acquisto: number;
  budget: number;
  percentuale_mutuo: number;
  liquidita: number;
  cliente_id: number;
  cliente: Cliente;
  casa_id: number;
  casa: Casa;
};

export type ClientePayload = {
  nome: string | null;
  cognome: string | null;
  numero_di_telefono: string | null;
  email: string | null;
  acquista: boolean;
  vende: boolean;
  vende_per_acquistare: boolean;
};

export type ZonaPayload = {
  nome: string;
};

export type CasaPayload = {
  piano: number | null;
  numero_di_locali: number | null;
  numero_di_camere: number | null;
  numero_di_bagni: number | null;
  balcone: boolean | null;
  terrazzo: boolean | null;
  giardino: boolean | null;
  zona_id: number;
};

export type RicercaCasaPayload = {
  tempo_di_acquisto: number;
  budget: number;
  percentuale_mutuo: number;
  liquidita: number;
  cliente_id: number;
  casa_id: number;
};
