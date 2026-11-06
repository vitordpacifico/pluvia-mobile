import { formatarCm, formatarDuracao } from '../formato';

it.each([
  [0, '0 segundos'],
  [45_000, '45 segundos'],
  [200_000, '3 min 20 s'],
  [7_500_000, '2 h 5 min'],
  [-5_000, '0 segundos'],
])('formatarDuracao(%p) = %p', (ms, esperado) => {
  expect(formatarDuracao(ms)).toBe(esperado);
});

it('usa virgula decimal nos centimetros', () => {
  expect(formatarCm(14.46)).toBe('14,5 cm');
});
