import { formatarCm, formatarDuracao, formatarHaQuanto, formatarHoraCurta } from '../formato';

it.each([
  [0, '0 segundos'],
  [45_000, '45 segundos'],
  [200_000, '3 min 20 s'],
  [7_500_000, '2 h 5 min'],
  [-5_000, '0 segundos'],
])('formatarDuracao(%p) = %p', (ms, esperado) => {
  expect(formatarDuracao(ms)).toBe(esperado);
});

it('usa vírgula decimal nos centímetros', () => {
  expect(formatarCm(14.46)).toBe('14,5 cm');
});

it('diz há quanto tempo algo aconteceu', () => {
  const agora = Date.parse('2026-11-07T15:00:00Z');
  expect(formatarHaQuanto('2026-11-07T14:59:50Z', agora)).toBe('agora mesmo');
  expect(formatarHaQuanto('2026-11-07T14:35:00Z', agora)).toBe('há 25 min');
  expect(formatarHaQuanto('2026-11-07T12:00:00Z', agora)).toBe('há 3 h');
  expect(formatarHaQuanto('2026-11-05T15:00:00Z', agora)).toBe('há 2 dia(s)');
});

it('mostra a hora sem os segundos', () => {
  const data = new Date(2026, 10, 7, 9, 5, 42);
  expect(formatarHoraCurta(data.toISOString())).toBe('09:05');
});
