import { FILTROS_PADRAO, filtrarOcorrencias, filtrosAtivos } from '../filtros';
import { CAMBUCI, ocorrencia, PERTO_DO_CAMBUCI, VILA_MARIANA } from '@/testes/fabricas';

const AGORA = Date.parse('2026-11-07T15:00:00Z');
const horasAtras = (horas: number) => new Date(AGORA - horas * 3_600_000).toISOString();

const LISTA = [
  ocorrencia({ id: 'longe', local: VILA_MARIANA }),
  ocorrencia({ id: 'perto', local: PERTO_DO_CAMBUCI, fonte: { tipo: 'SENSOR', nome: 'Sensor 1' } }),
  ocorrencia({ id: 'encerrada-hoje', status: 'ENCERRADO', encerradaEm: horasAtras(3) }),
  ocorrencia({ id: 'encerrada-ontem', status: 'ENCERRADO', encerradaEm: horasAtras(30) }),
];

const ids = (filtros = FILTROS_PADRAO) =>
  filtrarOcorrencias(LISTA, filtros, CAMBUCI, AGORA).map((item) => item.ocorrencia.id);

it('mostra primeiro as ativas, da mais perto para a mais longe', () => {
  expect(ids()).toEqual(['perto', 'longe', 'encerrada-hoje']);
});

it('esconde encerradas fora do período, mas nunca as ativas', () => {
  expect(ids({ ...FILTROS_PADRAO, periodoH: '1' })).toEqual(['perto', 'longe']);
  expect(ids({ ...FILTROS_PADRAO, periodoH: '72' })).toContain('encerrada-ontem');
});

it('filtra por situação, fonte e distância', () => {
  expect(ids({ ...FILTROS_PADRAO, status: 'ENCERRADOS' })).toEqual(['encerrada-hoje']);
  expect(ids({ ...FILTROS_PADRAO, fonte: 'SENSOR' })).toEqual(['perto']);
  expect(ids({ ...FILTROS_PADRAO, raioM: 500 })).toEqual(['perto', 'encerrada-hoje']);
});

it('conta quantos filtros fogem do padrão', () => {
  expect(filtrosAtivos(FILTROS_PADRAO)).toBe(0);
  expect(filtrosAtivos({ ...FILTROS_PADRAO, fonte: 'OFICIAL', raioM: 1000 })).toBe(2);
});
