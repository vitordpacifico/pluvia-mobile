import * as Crypto from 'expo-crypto';

import type { Coordenada } from '@/dominio/geo';
import type { MudancaStatus, Ocorrencia } from '@/dominio/ocorrencia';
import { ROTULO_TIPO_EVENTO, type Relato } from '@/dominio/relato';
import type { FaixaRisco, RiscoEstimado } from '@/dominio/riscoEstimado';
import { detectarEpisodios, nivelPelaDistancia, type Leitura } from '@/dominio/sensor';
import type { FonteDeDados, SensorNivel } from '@/dominio/tipos';
import { atualizarLista, CHAVES, lerJSON, lerLista, salvarJSON } from '@/servicos/armazenamento/armazenamento';
import { triarFotoSimulada } from '@/servicos/ia/triagem';

const INTERVALO_LEITURA_MS = 10_000;
const DURACAO_CHUVA_S = 360;
const ALTURA_INSTALACAO_CM = 250;
const NIVEL_SEM_CHUVA_CM = 2;
const MINUTO = 60_000;
const HORA = 60 * MINUTO;

interface Chuva {
  inicio: number;
  repetir: boolean;
}

interface EstadoSimulacao {
  chuvas: Record<string, Chuva>;
  encerradas: Record<string, string>;
}

interface SensorSimulado {
  id: string;
  nome: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  semSinalHaMs?: number;
}

interface OcorrenciaOficial {
  id: string;
  titulo: string;
  bairro: string;
  referencia: string;
  local: Coordenada;
  registradaHaMs: number;
  atualizadaHaMs: number;
  encerradaHaMs?: number;
}

interface AreaRisco {
  id: string;
  bairro: string;
  centro: Coordenada;
  raioM: number;
  faixaBase: FaixaRisco;
  sensorId?: string;
}

const FONTE_OFICIAL = 'CGE-SP (dados de demonstração)';

export const SENSORES_SIMULADOS: readonly SensorSimulado[] = [
  {
    id: 'sensor-1',
    nome: 'Sensor de demonstração 1',
    bairro: 'Cambuci',
    referencia: 'Av. do Estado',
    local: { latitude: -23.5662, longitude: -46.6196 },
  },
  {
    id: 'sensor-2',
    nome: 'Sensor de demonstração 2',
    bairro: 'Ipiranga',
    referencia: 'Margem do córrego do Ipiranga',
    local: { latitude: -23.5856, longitude: -46.608 },
  },
  {
    id: 'sensor-3',
    nome: 'Sensor de demonstração 3',
    bairro: 'Vila Prudente',
    referencia: 'Av. Prof. Luiz Ignácio Anhaia Mello',
    local: { latitude: -23.5839, longitude: -46.5806 },
    semSinalHaMs: 2 * HORA,
  },
];

const OCORRENCIAS_OFICIAIS: readonly OcorrenciaOficial[] = [
  {
    id: 'oficial-1',
    titulo: 'Alagamento na via',
    bairro: 'Ipiranga',
    referencia: 'Rua Silva Bueno, altura do 1000',
    local: { latitude: -23.5893, longitude: -46.6047 },
    registradaHaMs: 40 * MINUTO,
    atualizadaHaMs: 5 * MINUTO,
  },
  {
    id: 'oficial-2',
    titulo: 'Alagamento intransitável',
    bairro: 'Mooca',
    referencia: 'Rua da Mooca, perto do viaduto',
    local: { latitude: -23.5571, longitude: -46.6058 },
    registradaHaMs: 25 * MINUTO,
    atualizadaHaMs: 3 * MINUTO,
  },
  {
    id: 'oficial-3',
    titulo: 'Alagamento na via',
    bairro: 'Vila Prudente',
    referencia: 'Av. Prof. Luiz Ignácio Anhaia Mello, sentido centro',
    local: { latitude: -23.5851, longitude: -46.5833 },
    registradaHaMs: 3 * HORA,
    atualizadaHaMs: 2 * HORA,
  },
  {
    id: 'oficial-4',
    titulo: 'Alagamento na via',
    bairro: 'Aclimação',
    referencia: 'Rua Muniz de Sousa',
    local: { latitude: -23.5701, longitude: -46.6289 },
    registradaHaMs: 5 * HORA,
    atualizadaHaMs: 3 * HORA,
    encerradaHaMs: 3 * HORA,
  },
  {
    id: 'oficial-5',
    titulo: 'Alagamento na via',
    bairro: 'Brás',
    referencia: 'Av. Rangel Pestana',
    local: { latitude: -23.5452, longitude: -46.6178 },
    registradaHaMs: 30 * HORA,
    atualizadaHaMs: 28 * HORA,
    encerradaHaMs: 28 * HORA,
  },
];

const AREAS_RISCO: readonly AreaRisco[] = [
  {
    id: 'risco-cambuci',
    bairro: 'Cambuci',
    centro: { latitude: -23.5662, longitude: -46.6196 },
    raioM: 900,
    faixaBase: 'MODERADO',
    sensorId: 'sensor-1',
  },
  {
    id: 'risco-ipiranga',
    bairro: 'Ipiranga',
    centro: { latitude: -23.5869, longitude: -46.6094 },
    raioM: 1200,
    faixaBase: 'MODERADO',
    sensorId: 'sensor-2',
  },
  {
    id: 'risco-mooca',
    bairro: 'Mooca',
    centro: { latitude: -23.5599, longitude: -46.5996 },
    raioM: 1000,
    faixaBase: 'MODERADO',
  },
  {
    id: 'risco-vila-mariana',
    bairro: 'Vila Mariana',
    centro: { latitude: -23.5893, longitude: -46.6345 },
    raioM: 1000,
    faixaBase: 'BAIXO',
  },
];

let inicioSessao = Date.now();
let estado: EstadoSimulacao = { chuvas: {}, encerradas: {} };
let carregamento: Promise<void> | null = null;

function estadoPadrao(agora: number): EstadoSimulacao {
  return { chuvas: { 'sensor-1': { inicio: agora, repetir: true } }, encerradas: {} };
}

function ehChuva(valor: unknown): valor is Chuva {
  if (typeof valor !== 'object' || valor === null) return false;
  const chuva = valor as Record<string, unknown>;
  return typeof chuva.inicio === 'number' && typeof chuva.repetir === 'boolean';
}

function carregarEstado(): Promise<void> {
  carregamento ??= lerJSON<Partial<EstadoSimulacao> | null>(CHAVES.simulacao, null)
    .then((salvo) => {
      const chuvas = Object.fromEntries(
        Object.entries(salvo?.chuvas ?? {}).filter(([, chuva]) => ehChuva(chuva)),
      );
      estado =
        Object.keys(chuvas).length > 0
          ? { chuvas, encerradas: { ...(salvo?.encerradas ?? {}) } }
          : estadoPadrao(Date.now());
    })
    .catch(() => {
      estado = estadoPadrao(Date.now());
    });
  return carregamento;
}

function salvarEstado(): Promise<void> {
  return salvarJSON(CHAVES.simulacao, estado);
}

export function reiniciarSimulacao(agora = Date.now()): void {
  inicioSessao = agora;
  estado = estadoPadrao(agora);
  carregamento = Promise.resolve();
  salvarEstado().catch(() => undefined);
}

function nivelDaChuvaForte(segundos: number): number {
  if (segundos < 0) return NIVEL_SEM_CHUVA_CM;
  if (segundos < 30) return 3;
  if (segundos < 150) return 3 + ((segundos - 30) * 45) / 120;
  if (segundos < 210) return 48;
  if (segundos < 300) return 48 - ((segundos - 210) * 45) / 90;
  return 3;
}

function nivelReal(sensorId: string, instante: number): number {
  const chuva = estado.chuvas[sensorId];
  if (!chuva) return NIVEL_SEM_CHUVA_CM;
  let segundos = (instante - chuva.inicio) / 1000;
  if (chuva.repetir && segundos >= 0) segundos %= DURACAO_CHUVA_S;
  return nivelDaChuvaForte(segundos);
}

function medir(sensorId: string, instante: number): Leitura {
  const ruido = Math.sin(instante / 7000) * 0.4;
  const distancia = ALTURA_INSTALACAO_CM - nivelReal(sensorId, instante) + ruido;
  const nivel = nivelPelaDistancia(ALTURA_INSTALACAO_CM, distancia);
  return { nivelCm: Math.round(nivel * 10) / 10, medidoEm: new Date(instante).toISOString() };
}

function ultimasLeituras(sensor: SensorSimulado, agora: number, quantidade: number): Leitura[] {
  const ultimoPasso = Math.floor((agora - (sensor.semSinalHaMs ?? 0)) / INTERVALO_LEITURA_MS);
  const leituras: Leitura[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    leituras.push(medir(sensor.id, (ultimoPasso - i) * INTERVALO_LEITURA_MS));
  }
  return leituras;
}

function montarSensor(sensor: SensorSimulado, agora: number): SensorNivel {
  const leituras = ultimasLeituras(sensor, agora, 18);
  const ultima = leituras[leituras.length - 1];
  return {
    id: sensor.id,
    nome: sensor.nome,
    bairro: sensor.bairro,
    referencia: sensor.referencia,
    local: sensor.local,
    nivelCm: ultima.nivelCm,
    atualizadoEm: ultima.medidoEm,
    leituras,
  };
}

function ciclosDaChuva(chuva: Chuva, agora: number): number[] {
  if (chuva.inicio > agora) return [];
  if (!chuva.repetir) return [chuva.inicio];
  const duracaoMs = DURACAO_CHUVA_S * 1000;
  const atual = Math.floor((agora - chuva.inicio) / duracaoMs);
  const ciclos: number[] = [];
  for (let k = Math.max(0, atual - 2); k <= atual; k++) ciclos.push(chuva.inicio + k * duracaoMs);
  return ciclos;
}

function ocorrenciasDoSensor(sensor: SensorSimulado, agora: number): Ocorrencia[] {
  const chuva = estado.chuvas[sensor.id];
  if (!chuva || sensor.semSinalHaMs) return [];
  const ocorrencias: Ocorrencia[] = [];

  for (const inicioCiclo of ciclosDaChuva(chuva, agora)) {
    const fimCiclo = Math.min(inicioCiclo + DURACAO_CHUVA_S * 1000, agora);
    const leituras: Leitura[] = [];
    for (let t = inicioCiclo; t <= fimCiclo; t += INTERVALO_LEITURA_MS) leituras.push(medir(sensor.id, t));
    const episodio = detectarEpisodios(leituras)[0];
    if (!episodio) continue;

    const ultima = leituras[leituras.length - 1];
    const historico: MudancaStatus[] = [
      {
        status: 'ATIVO',
        em: episodio.inicio,
        descricao: 'O sensor mediu água acima do limite em 2 leituras seguidas.',
      },
    ];
    if (episodio.fim) {
      historico.push({
        status: 'ENCERRADO',
        em: episodio.fim,
        descricao: 'O nível voltou ao normal em 2 leituras seguidas.',
      });
    }
    ocorrencias.push({
      id: `${sensor.id}-${inicioCiclo}`,
      titulo: 'Alagamento medido por sensor',
      bairro: sensor.bairro,
      referencia: sensor.referencia,
      local: sensor.local,
      fonte: { tipo: 'SENSOR', nome: `${sensor.nome} (ESP32)` },
      status: episodio.fim ? 'ENCERRADO' : 'ATIVO',
      registradaEm: episodio.inicio,
      atualizadaEm: episodio.fim ?? ultima.medidoEm,
      encerradaEm: episodio.fim,
      historico,
      nivelCm: episodio.fim ? episodio.picoCm : ultima.nivelCm,
    });
  }
  return ocorrencias;
}

function aplicarEncerramento(ocorrencia: Ocorrencia): Ocorrencia {
  const encerradaEm = estado.encerradas[ocorrencia.id];
  if (!encerradaEm || ocorrencia.status === 'ENCERRADO') return ocorrencia;
  return {
    ...ocorrencia,
    status: 'ENCERRADO',
    encerradaEm,
    atualizadaEm: encerradaEm,
    historico: [
      ...ocorrencia.historico,
      { status: 'ENCERRADO', em: encerradaEm, descricao: 'A fonte marcou a ocorrência como encerrada.' },
    ],
  };
}

function ocorrenciaOficial(oficial: OcorrenciaOficial): Ocorrencia {
  const registradaEm = new Date(inicioSessao - oficial.registradaHaMs).toISOString();
  const atualizadaEm = new Date(inicioSessao - oficial.atualizadaHaMs).toISOString();
  const encerradaEm =
    oficial.encerradaHaMs === undefined ? null : new Date(inicioSessao - oficial.encerradaHaMs).toISOString();
  const historico: MudancaStatus[] = [
    { status: 'ATIVO', em: registradaEm, descricao: 'Ocorrência registrada pela fonte.' },
  ];
  if (encerradaEm) {
    historico.push({ status: 'ENCERRADO', em: encerradaEm, descricao: 'A fonte marcou a ocorrência como encerrada.' });
  }
  return aplicarEncerramento({
    id: oficial.id,
    titulo: oficial.titulo,
    bairro: oficial.bairro,
    referencia: oficial.referencia,
    local: oficial.local,
    fonte: { tipo: 'OFICIAL', nome: FONTE_OFICIAL },
    status: encerradaEm ? 'ENCERRADO' : 'ATIVO',
    registradaEm,
    atualizadaEm,
    encerradaEm,
    historico,
  });
}

function ocorrenciaComunitaria(relato: Relato): Ocorrencia {
  const publicadoEm = relato.revisadoEm ?? relato.enviadoEm;
  return aplicarEncerramento({
    id: relato.ocorrenciaId ?? `relato-${relato.id}`,
    titulo: ROTULO_TIPO_EVENTO[relato.tipo],
    bairro: relato.bairro,
    referencia: relato.referencia,
    local: relato.local,
    fonte: { tipo: 'COMUNIDADE', nome: 'Relato comunitário verificado' },
    status: 'ATIVO',
    registradaEm: publicadoEm,
    atualizadaEm: publicadoEm,
    encerradaEm: null,
    historico: [
      { status: 'ATIVO', em: publicadoEm, descricao: 'Relato de morador verificado e publicado pela equipe.' },
    ],
    relatoId: relato.id,
  });
}

function faixaDaArea(area: AreaRisco, agora: number): FaixaRisco {
  if (!area.sensorId) return area.faixaBase;
  const sensor = SENSORES_SIMULADOS.find((s) => s.id === area.sensorId);
  if (!sensor || sensor.semSinalHaMs) return area.faixaBase;
  return medir(sensor.id, agora).nivelCm >= 10 ? 'ELEVADO' : area.faixaBase;
}

function aguardar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

function lerRelatos(): Promise<Relato[]> {
  return lerLista<Relato>(CHAVES.relatosSimulados);
}

export const fonteSimulada: FonteDeDados = {
  simulada: true,

  async listarOcorrencias() {
    await Promise.all([carregarEstado(), aguardar(300)]);
    const agora = Date.now();
    const relatos = await lerRelatos();
    return [
      ...SENSORES_SIMULADOS.flatMap((sensor) => ocorrenciasDoSensor(sensor, agora)),
      ...OCORRENCIAS_OFICIAIS.map(ocorrenciaOficial),
      ...relatos.filter((r) => r.status === 'PUBLICADO').map(ocorrenciaComunitaria),
    ];
  },

  async listarRiscos() {
    await carregarEstado();
    const agora = Date.now();
    const calculadoEm = new Date(Math.floor(agora / (5 * MINUTO)) * 5 * MINUTO).toISOString();
    return AREAS_RISCO.map(
      (area): RiscoEstimado => {
        const faixa = faixaDaArea(area, agora);
        return {
          id: area.id,
          bairro: area.bairro,
          centro: area.centro,
          raioM: area.raioM,
          faixa,
          calculadoEm,
          validoAte: new Date(agora + HORA).toISOString(),
          motivo:
            faixa === 'ELEVADO'
              ? 'Chuva forte medida agora e histórico de alagamentos na região.'
              : faixa === 'MODERADO'
                ? 'Região com histórico de alagamentos em dias de chuva.'
                : 'Poucos registros de alagamento na região.',
        };
      },
    );
  },

  async listarSensores() {
    await carregarEstado();
    const agora = Date.now();
    return SENSORES_SIMULADOS.map((sensor) => montarSensor(sensor, agora));
  },

  async enviarRelato(autorId, novo) {
    await aguardar(1200);
    const agora = new Date();
    const relato: Relato = {
      ...novo,
      id: Crypto.randomUUID(),
      autorId,
      enviadoEm: agora.toISOString(),
      triagem: triarFotoSimulada(novo.tipo, novo.fotoUri !== null, agora),
      status: 'EM_ANALISE',
      revisadoEm: null,
      motivoRecusa: null,
      ocorrenciaId: null,
    };
    await atualizarLista<Relato>(CHAVES.relatosSimulados, (lista) => [relato, ...lista]);
    return relato;
  },

  async listarRelatos(filtro) {
    const relatos = await lerRelatos();
    return relatos
      .filter((r) => !filtro.autorId || r.autorId === filtro.autorId)
      .filter((r) => !filtro.status || r.status === filtro.status)
      .sort((a, b) => Date.parse(b.enviadoEm) - Date.parse(a.enviadoEm));
  },

  async excluirRelato(autorId, relatoId) {
    await atualizarLista<Relato>(CHAVES.relatosSimulados, (lista) =>
      lista.filter((r) => !(r.id === relatoId && r.autorId === autorId)),
    );
  },

  async excluirRelatosDoAutor(autorId) {
    await atualizarLista<Relato>(CHAVES.relatosSimulados, (lista) => lista.filter((r) => r.autorId !== autorId));
  },

  async revisarRelato(relatoId, decisao) {
    const revisadoEm = new Date().toISOString();
    const lista = await atualizarLista<Relato>(CHAVES.relatosSimulados, (relatos) =>
      relatos.map((r) =>
        r.id !== relatoId
          ? r
          : {
              ...r,
              status: decisao.publicar ? 'PUBLICADO' : 'RECUSADO',
              revisadoEm,
              motivoRecusa: decisao.publicar ? null : (decisao.motivo ?? 'Evidência insuficiente.'),
              ocorrenciaId: decisao.publicar ? `relato-${r.id}` : null,
            },
      ),
    );
    const revisado = lista.find((r) => r.id === relatoId);
    if (!revisado) throw new Error('Relato não encontrado.');
    return revisado;
  },

  async encerrarOcorrencia(ocorrenciaId) {
    await carregarEstado();
    if (ocorrenciaId.startsWith('sensor-')) {
      throw new Error('Ocorrências de sensor são encerradas pelas próprias leituras.');
    }
    estado = { ...estado, encerradas: { ...estado.encerradas, [ocorrenciaId]: new Date().toISOString() } };
    await salvarEstado();
  },

  async simularChuva(sensorId) {
    await carregarEstado();
    const sensor = SENSORES_SIMULADOS.find((s) => s.id === sensorId);
    if (!sensor) throw new Error('Sensor não encontrado.');
    if (sensor.semSinalHaMs) throw new Error('Este sensor está sem sinal.');
    estado = { ...estado, chuvas: { ...estado.chuvas, [sensorId]: { inicio: Date.now(), repetir: false } } };
    await salvarEstado();
  },
};
