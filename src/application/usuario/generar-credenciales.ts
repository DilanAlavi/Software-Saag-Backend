import { randomInt } from 'crypto';

const RANGO_DIACRITICOS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(RANGO_DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function digitosAleatorios(cantidad: number): string {
  let resultado = '';
  for (let i = 0; i < cantidad; i++) {
    resultado += randomInt(0, 10).toString();
  }
  return resultado;
}

function sufijoAleatorio(cantidad: number): string {
  const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let resultado = '';
  for (let i = 0; i < cantidad; i++) {
    resultado += caracteres[randomInt(0, caracteres.length)];
  }
  return resultado;
}

export function generarUsername(apellidoPaterno: string): string {
  return `${normalizar(apellidoPaterno)}.${digitosAleatorios(5)}`;
}

export function generarPassword(apellidoPaterno: string, ciOCelular: string): string {
  const base = normalizar(apellidoPaterno);
  const numeroCorto = ciOCelular.slice(-4);
  return `${base}.${numeroCorto}${sufijoAleatorio(3)}`;
}
