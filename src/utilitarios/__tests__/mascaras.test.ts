import { mascararCep, mascararHora, mascararTelefone, somenteDigitos } from '../mascaras';

describe('mascararTelefone', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['1191234', '(11) 9123-4'],
    ['1112345678', '(11) 1234-5678'],
    ['11912345678', '(11) 91234-5678'],
    ['119123456789999', '(11) 91234-5678'],
    ['+55 (11) 9.1234-5678', '(55) 11912-3456'],
  ])('%p vira %p', (digitado, esperado) => {
    expect(mascararTelefone(digitado)).toBe(esperado);
  });
});

describe('mascararCep', () => {
  it.each([
    ['', ''],
    ['01001', '01001'],
    ['010010', '01001-0'],
    ['01001000', '01001-000'],
    ['01001-000123', '01001-000'],
    ['abc01001def000', '01001-000'],
  ])('%p vira %p', (digitado, esperado) => {
    expect(mascararCep(digitado)).toBe(esperado);
  });
});

describe('mascararHora', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['14', '14'],
    ['143', '14:3'],
    ['1430', '14:30'],
    ['14:305', '14:30'],
    ['ab9h05', '90:5'],
  ])('%p vira %p', (digitado, esperado) => {
    expect(mascararHora(digitado)).toBe(esperado);
  });
});

it('remove tudo que não é dígito', () => {
  expect(somenteDigitos('(11) 9-12')).toBe('11912');
});
