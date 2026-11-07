import { checarContexto } from '../moderacao';
import { detectarEpisodios, nivelPelaDistancia, type Leitura } from '../sensor';
import type { SensorNivel } from '../tipos';
import { CAMBUCI, ocorrencia, relato, VILA_MARIANA } from '@/testes/fabricas';

function leituras(niveis: number[]): Leitura[] {
  return niveis.map((nivelCm, i) => ({ nivelCm, medidoEm: new Date(Date.UTC(2026, 10, 7, 15, 0, i * 10)).toISOString() }));
}

it('converte a distância do sensor ultrassônico em nível da água', () => {
  expect(nivelPelaDistancia(250, 230)).toBe(20);
  expect(nivelPelaDistancia(250, 260)).toBe(0);
});

describe('detectarEpisodios', () => {
  it('só abre a ocorrência depois de 2 leituras seguidas acima do limite', () => {
    expect(detectarEpisodios(leituras([2, 25, 3, 25, 4]))).toEqual([]);
    const [episodio] = detectarEpisodios(leituras([2, 22, 30, 40]));
    expect(episodio).toEqual({ inicio: '2026-11-07T15:00:10.000Z', fim: null, picoCm: 40 });
  });

  it('só encerra depois de 2 leituras seguidas abaixo do limite de fim', () => {
    const [episodio] = detectarEpisodios(leituras([22, 30, 5, 12, 6, 4]));
    expect(episodio.fim).toBe('2026-11-07T15:00:50.000Z');
    expect(episodio.picoCm).toBe(30);
  });

  it('separa dois episódios de chuva', () => {
    expect(detectarEpisodios(leituras([22, 25, 3, 2, 21, 24]))).toHaveLength(2);
  });
});

describe('checarContexto', () => {
  const sensor: SensorNivel = {
    id: 'sensor-1',
    nome: 'Sensor 1',
    bairro: 'Cambuci',
    referencia: 'Av. do Estado',
    local: CAMBUCI,
    nivelCm: 35,
    atualizadoEm: new Date().toISOString(),
    leituras: [],
  };

  it('reforça o relato quando há ocorrência, sensor alto e outro relato perto', () => {
    const alvo = relato();
    const pistas = checarContexto(alvo, [ocorrencia()], [sensor], [alvo, relato({ id: 'rel2' })]);
    expect(pistas.map((p) => p.reforca)).toEqual([true, true, true]);
    expect(pistas[1].texto).toContain('mede 35 cm de água');
  });

  it('não reforça um relato isolado', () => {
    const isolado = relato({ local: VILA_MARIANA });
    const pistas = checarContexto(isolado, [ocorrencia()], [sensor], [isolado]);
    expect(pistas.every((p) => !p.reforca)).toBe(true);
    expect(pistas[1].texto).toBe('Nenhum sensor a menos de 1 km');
  });
});
