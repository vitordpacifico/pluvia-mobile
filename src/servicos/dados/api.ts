import type { Coordenada } from '@/dominio/geo';
import type { MudancaStatus, Ocorrencia, StatusOcorrencia, TipoFonte } from '@/dominio/ocorrencia';
import type { CategoriaTriagem, Relato, StatusRelato, TipoEvento, Triagem } from '@/dominio/relato';
import type { FaixaRisco, RiscoEstimado } from '@/dominio/riscoEstimado';
import type { Leitura } from '@/dominio/sensor';
import type { FonteDeDados, SensorNivel } from '@/dominio/tipos';

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

type Objeto = Record<string, unknown>;

function ehObjeto(valor: unknown): valor is Objeto {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function objeto(valor: unknown, campo = 'resposta'): Objeto {
  if (!ehObjeto(valor)) throw new Error(`Resposta inválida da API: campo "${campo}".`);
  return valor;
}

function texto(origem: Objeto, campo: string): string {
  const valor = origem[campo];
  if (typeof valor !== 'string') throw new Error(`Resposta inválida da API: campo "${campo}".`);
  return valor;
}

function textoOuNulo(origem: Objeto, campo: string): string | null {
  const valor = origem[campo];
  if (valor === null || valor === undefined) return null;
  if (typeof valor !== 'string') throw new Error(`Resposta inválida da API: campo "${campo}".`);
  return valor;
}

function numero(origem: Objeto, campo: string): number {
  const valor = origem[campo];
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(`Resposta inválida da API: campo "${campo}".`);
  }
  return valor;
}

function opcao<T extends string>(origem: Objeto, campo: string, validas: readonly T[]): T {
  const valor = origem[campo];
  if (typeof valor !== 'string' || !(validas as readonly string[]).includes(valor)) {
    throw new Error(`Resposta inválida da API: campo "${campo}".`);
  }
  return valor as T;
}

function lista<T>(bruto: unknown, ler: (item: unknown) => T): T[] {
  if (!Array.isArray(bruto)) throw new Error('Resposta inválida da API: era esperada uma lista.');
  return bruto.map(ler);
}

const STATUS_OCORRENCIA: readonly StatusOcorrencia[] = ['ATIVO', 'ENCERRADO'];
const TIPOS_FONTE: readonly TipoFonte[] = ['OFICIAL', 'SENSOR', 'COMUNIDADE'];
const FAIXAS: readonly FaixaRisco[] = ['BAIXO', 'MODERADO', 'ELEVADO'];
const TIPOS_EVENTO: readonly TipoEvento[] = ['RUA_ALAGADA', 'AGUA_SUBINDO', 'CHUVA_FORTE', 'OUTRO'];
const STATUS_RELATO: readonly StatusRelato[] = ['EM_ANALISE', 'PUBLICADO', 'RECUSADO'];
const CATEGORIAS: readonly CategoriaTriagem[] = ['INDICIO', 'SEM_INDICIO', 'INCONCLUSIVA'];

function lerCoordenada(bruto: unknown, campo: string): Coordenada {
  const ponto = objeto(bruto, campo);
  return { latitude: numero(ponto, 'latitude'), longitude: numero(ponto, 'longitude') };
}

function lerMudanca(bruto: unknown): MudancaStatus {
  const mudanca = objeto(bruto, 'historico');
  return {
    status: opcao(mudanca, 'status', STATUS_OCORRENCIA),
    em: texto(mudanca, 'em'),
    descricao: texto(mudanca, 'descricao'),
  };
}

export function lerOcorrencia(bruto: unknown): Ocorrencia {
  const o = objeto(bruto);
  const fonte = objeto(o.fonte, 'fonte');
  const ocorrencia: Ocorrencia = {
    id: texto(o, 'id'),
    titulo: texto(o, 'titulo'),
    bairro: texto(o, 'bairro'),
    referencia: texto(o, 'referencia'),
    local: lerCoordenada(o.local, 'local'),
    fonte: { tipo: opcao(fonte, 'tipo', TIPOS_FONTE), nome: texto(fonte, 'nome') },
    status: opcao(o, 'status', STATUS_OCORRENCIA),
    registradaEm: texto(o, 'registradaEm'),
    atualizadaEm: texto(o, 'atualizadaEm'),
    encerradaEm: textoOuNulo(o, 'encerradaEm'),
    historico: Array.isArray(o.historico) ? o.historico.map(lerMudanca) : [],
  };
  if (typeof o.nivelCm === 'number') ocorrencia.nivelCm = o.nivelCm;
  if (typeof o.relatoId === 'string') ocorrencia.relatoId = o.relatoId;
  return ocorrencia;
}

export function lerRisco(bruto: unknown): RiscoEstimado {
  const r = objeto(bruto);
  return {
    id: texto(r, 'id'),
    bairro: texto(r, 'bairro'),
    centro: lerCoordenada(r.centro, 'centro'),
    raioM: numero(r, 'raioM'),
    faixa: opcao(r, 'faixa', FAIXAS),
    calculadoEm: texto(r, 'calculadoEm'),
    validoAte: texto(r, 'validoAte'),
    motivo: texto(r, 'motivo'),
  };
}

function lerLeitura(bruto: unknown): Leitura {
  const l = objeto(bruto, 'leituras');
  return { nivelCm: numero(l, 'nivelCm'), medidoEm: texto(l, 'medidoEm') };
}

function lerSensor(bruto: unknown): SensorNivel {
  const s = objeto(bruto);
  return {
    id: texto(s, 'id'),
    nome: texto(s, 'nome'),
    bairro: texto(s, 'bairro'),
    referencia: texto(s, 'referencia'),
    local: lerCoordenada(s.local, 'local'),
    nivelCm: numero(s, 'nivelCm'),
    atualizadoEm: texto(s, 'atualizadoEm'),
    leituras: Array.isArray(s.leituras) ? s.leituras.map(lerLeitura) : [],
  };
}

function lerTriagem(bruto: unknown): Triagem | null {
  if (bruto === null || bruto === undefined) return null;
  const t = objeto(bruto, 'triagem');
  return {
    categoria: opcao(t, 'categoria', CATEGORIAS),
    confianca: numero(t, 'confianca'),
    analisadaEm: texto(t, 'analisadaEm'),
    simulada: t.simulada === true,
  };
}

export function lerRelato(bruto: unknown): Relato {
  const r = objeto(bruto);
  return {
    id: texto(r, 'id'),
    autorId: texto(r, 'autorId'),
    tipo: opcao(r, 'tipo', TIPOS_EVENTO),
    descricao: typeof r.descricao === 'string' ? r.descricao : '',
    bairro: texto(r, 'bairro'),
    referencia: texto(r, 'referencia'),
    local: lerCoordenada(r.local, 'local'),
    ocorridoEm: texto(r, 'ocorridoEm'),
    enviadoEm: texto(r, 'enviadoEm'),
    fotoUri: textoOuNulo(r, 'fotoUrl'),
    triagem: lerTriagem(r.triagem),
    status: opcao(r, 'status', STATUS_RELATO),
    revisadoEm: textoOuNulo(r, 'revisadoEm'),
    motivoRecusa: textoOuNulo(r, 'motivoRecusa'),
    ocorrenciaId: textoOuNulo(r, 'ocorrenciaId'),
  };
}

async function enviarFoto(base: string, fotoUri: string): Promise<string> {
  const formulario = new FormData();
  formulario.append('foto', { uri: fotoUri, name: 'relato.jpg', type: 'image/jpeg' } as unknown as Blob);
  const resposta = await fetch(`${base}/fotos/analise`, { method: 'POST', body: formulario });
  if (!resposta.ok) throw new Error(`A API respondeu com o código ${resposta.status}.`);
  return texto(objeto(await resposta.json()), 'fotoId');
}

export function criarFonteHttp(urlBase: string): FonteDeDados {
  const base = urlBase.replace(/\/+$/, '');
  const caminho = (trecho: string) => `${base}${trecho}`;

  return {
    simulada: false,

    async listarOcorrencias() {
      return lista(await requisitar(caminho('/ocorrencias')), lerOcorrencia);
    },

    async listarRiscos() {
      return lista(await requisitar(caminho('/riscos')), lerRisco);
    },

    async listarSensores() {
      return lista(await requisitar(caminho('/sensores')), lerSensor);
    },

    async enviarRelato(autorId, relato) {
      const fotoId = relato.fotoUri ? await enviarFoto(base, relato.fotoUri) : null;
      const { fotoUri: _foto, ...dados } = relato;
      const resposta = await requisitar(caminho('/relatos'), {
        method: 'POST',
        body: JSON.stringify({ ...dados, autorId, fotoId }),
      });
      return lerRelato(resposta);
    },

    async listarRelatos(filtro) {
      const parametros = new URLSearchParams();
      if (filtro.autorId) parametros.set('autorId', filtro.autorId);
      if (filtro.status) parametros.set('status', filtro.status);
      const consulta = parametros.toString();
      return lista(await requisitar(caminho(`/relatos${consulta ? `?${consulta}` : ''}`)), lerRelato);
    },

    async excluirRelato(autorId, relatoId) {
      await requisitar(caminho(`/relatos/${encodeURIComponent(relatoId)}?autorId=${encodeURIComponent(autorId)}`), {
        method: 'DELETE',
      });
    },

    async excluirRelatosDoAutor(autorId) {
      await requisitar(caminho(`/relatos?autorId=${encodeURIComponent(autorId)}`), { method: 'DELETE' });
    },

    async revisarRelato(relatoId, decisao) {
      const resposta = await requisitar(caminho(`/relatos/${encodeURIComponent(relatoId)}/revisao`), {
        method: 'POST',
        body: JSON.stringify(decisao),
      });
      return lerRelato(resposta);
    },

    async encerrarOcorrencia(ocorrenciaId) {
      await requisitar(caminho(`/ocorrencias/${encodeURIComponent(ocorrenciaId)}/encerramento`), {
        method: 'POST',
      });
    },

    async simularChuva(sensorId) {
      await requisitar(caminho('/sensores/leituras'), {
        method: 'POST',
        body: JSON.stringify({ sensorId, simulacao: 'chuva-forte' }),
      });
    },
  };
}
