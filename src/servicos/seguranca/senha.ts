import * as Crypto from 'expo-crypto';

/**
 * A senha nunca e salva em texto. O app guarda so um sal aleatorio e o hash SHA-256 de sal + senha.
 *
 * Limite conhecido: em um sistema real a autenticacao ficaria no servidor, com um algoritmo lento
 * feito para senhas (bcrypt ou Argon2). Aqui o login e local porque a API ainda nao existe.
 */

function paraHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function gerarSal(): string {
  return paraHex(Crypto.getRandomBytes(16));
}

export async function calcularHashSenha(senha: string, sal: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${sal}:${senha}`);
}

/** Compara todos os caracteres, mesmo depois de achar uma diferenca, para nao vazar tempo. */
export function hashesIguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

export async function senhaConfere(senha: string, sal: string, hashSalvo: string): Promise<boolean> {
  return hashesIguais(await calcularHashSenha(senha, sal), hashSalvo);
}
