import {
  bairroMaisProximo,
  buscarBairros,
  dentroDoRaio,
  distanciaMetros,
  ehRaioMonitoramento,
  formatarDistancia,
} from '../geo';
import { CAMBUCI, PERTO_DO_CAMBUCI, VILA_MARIANA } from '@/testes/fabricas';

it('calcula a distância entre dois pontos em metros', () => {
  expect(distanciaMetros(CAMBUCI, CAMBUCI)).toBe(0);
  const perto = distanciaMetros(CAMBUCI, PERTO_DO_CAMBUCI);
  expect(perto).toBeGreaterThan(200);
  expect(perto).toBeLessThan(300);
  expect(distanciaMetros(CAMBUCI, VILA_MARIANA)).toBeGreaterThan(2500);
});

it('diz se um ponto está dentro do raio', () => {
  expect(dentroDoRaio(CAMBUCI, PERTO_DO_CAMBUCI, 500)).toBe(true);
  expect(dentroDoRaio(CAMBUCI, VILA_MARIANA, 500)).toBe(false);
});

it.each([
  [3, '10 m'],
  [254, '250 m'],
  [999, '1000 m'],
  [1000, '1,0 km'],
  [2345, '2,3 km'],
])('formata %p metros como %p', (metros, esperado) => {
  expect(formatarDistancia(metros)).toBe(esperado);
});

it('busca bairros sem diferenciar acento e maiúsculas', () => {
  expect(buscarBairros('sacoma').map((b) => b.nome)).toEqual(['Sacomã']);
  expect(buscarBairros('VILA').map((b) => b.nome)).toEqual(['Vila Prudente', 'Vila Mariana']);
  expect(buscarBairros('')).toHaveLength(10);
  expect(buscarBairros('Copacabana')).toEqual([]);
});

it('acha o bairro mais próximo de uma coordenada', () => {
  expect(bairroMaisProximo(PERTO_DO_CAMBUCI).nome).toBe('Cambuci');
  expect(bairroMaisProximo(VILA_MARIANA).nome).toBe('Vila Mariana');
});

it('aceita só os raios oferecidos no app', () => {
  expect(ehRaioMonitoramento(500)).toBe(true);
  expect(ehRaioMonitoramento(750)).toBe(false);
  expect(ehRaioMonitoramento('500')).toBe(false);
});
