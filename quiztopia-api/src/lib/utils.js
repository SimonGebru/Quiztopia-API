import { v4 as uuid } from 'uuid';
export const newId = () => uuid();
export const nowIso = () => new Date().toISOString();
export const rankKey = (score) => String(1_000_000_000 - Number(score)).padStart(10,'0');