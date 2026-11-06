import { ehNivelRisco } from '@/dominio/risco';
import type { FonteDeDados, Leitura, LimitesRisco, PontoMonitorado } from '@/dominio/tipos';

/**
 * Cliente da API real em C#. O contrato e uma proposta, descrita em docs/API.md,
 * e precisa ser combinado com quem desenvolve a API.
 */

const TEMPO_LIMITE_MS = 10_000;

async function requisitar(url: string, opcoes: RequestInit = {}): Promise<unknown> {
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(url, {
      ...opcoes,
      signal: controle.signal,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    if (!resposta.ok) throw new Error(`A API respondeu com o código ${resposta.status}.`);
    return resposta.status === 204 ? null : await resposta.json();
  } catch (erro) {
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new Error('A API demorou demais para responder.');
    }
    throw erro;
  } finally {
    clearTimeout(temporizador);
  }
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function texto(objeto: Record<string, unknown>, campo: string): string {
  const valor = objeto[campo];
  if (typeof valor !== 'string') throw new Error(`Resposta inválida da API: campo "${campo}".`);
  return valor;
}

function numero(objeto: Record<string, unknown>, campo: string): number {
  const valor = objeto[campo];
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(`Resposta inválida da API: campo "${campo}".`);
  }
  return valor;
}

/** Confere o formato do que chega da rede antes de usar no app. */
function lerPonto(bruto: unknown): PontoMonitorado {
  if (!ehObjeto(bruto) || !ehObjeto(bruto.limites)) throw new Error('Resposta inválida da API.');
  const risco = bruto.risco;
  if (!ehNivelRisco(risco)) throw new Error('Resposta inválida da API: campo "risco".');
  const limites: LimitesRisco = {
    atencaoCm: numero(bruto.limites, 'atencaoCm'),
    alertaCm: numero(bruto.limites, 'alertaCm'),
    evacuacaoCm: numero(bruto.limites, 'evacuacaoCm'),
  };
  return {
    id: texto(bruto, 'id'),
    nome: texto(bruto, 'nome'),
    endereco: texto(bruto, 'endereco'),
    regiao: texto(bruto, 'regiao'),
    nivelAtualCm: numero(bruto, 'nivelAtualCm'),
    risco,
    riscoDetectadoEm: typeof bruto.riscoDetectadoEm === 'string' ? bruto.riscoDetectadoEm : null,
    atualizadoEm: texto(bruto, 'atualizadoEm'),
    limites,
  };
}

function lerLeitura(bruto: unknown): Leitura {
  if (!ehObjeto(bruto)) throw new Error('Resposta inválida da API.');
  return {
    pontoId: texto(bruto, 'pontoId'),
    nivelCm: numero(bruto, 'nivelCm'),
    medidoEm: texto(bruto, 'medidoEm'),
  };
}

function lerLista<T>(bruto: unknown, ler: (item: unknown) => T): T[] {
  if (!Array.isArray(bruto)) throw new Error('Resposta inválida da API: era esperada uma lista.');
  return bruto.map(ler);
}

export function criarFonteHttp(urlBase: string): FonteDeDados {
  const base = urlBase.replace(/\/+$/, '');
  return {
    simulada: false,

    async listarPontos() {
      return lerLista(await requisitar(`${base}/api/pontos`), lerPonto);
    },

    async listarLeituras(pontoId) {
      const caminho = `${base}/api/pontos/${encodeURIComponent(pontoId)}/leituras?limite=18`;
      const leituras = lerLista(await requisitar(caminho), lerLeitura);
      return leituras.sort((a, b) => Date.parse(a.medidoEm) - Date.parse(b.medidoEm));
    },

    async registrarConfirmacao(pontoId, confirmadoEm) {
      await requisitar(`${base}/api/confirmacoes`, {
        method: 'POST',
        body: JSON.stringify({ pontoId, confirmadoEm }),
      });
    },

    async atualizarLimites(pontoId, limites) {
      await requisitar(`${base}/api/pontos/${encodeURIComponent(pontoId)}/limites`, {
        method: 'PUT',
        body: JSON.stringify(limites),
      });
    },
  };
}
