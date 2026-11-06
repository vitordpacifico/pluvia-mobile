import {
  centimetrosParaTexto,
  lerCentimetros,
  mascararCentimetros,
  mascararCep,
  mascararTelefone,
  somenteDigitos,
} from '../mascaras';

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

describe('mascararCentimetros', () => {
  it.each([
    ['', ''],
    ['12', '12'],
    ['1234', '123'],
    ['12,5', '12,5'],
    ['12.5', '12,5'],
    ['12,55', '12,5'],
    ['1,2,3', '1,2'],
    ['a1b0', '10'],
  ])('%p vira %p', (digitado, esperado) => {
    expect(mascararCentimetros(digitado)).toBe(esperado);
  });
});

it('converte o texto de centimetros em numero', () => {
  expect(lerCentimetros('12,5')).toBe(12.5);
  expect(lerCentimetros('40')).toBe(40);
  expect(lerCentimetros('')).toBeNull();
  expect(lerCentimetros(' ')).toBeNull();
});

it('converte numero em texto com virgula', () => {
  expect(centimetrosParaTexto(12.5)).toBe('12,5');
  expect(centimetrosParaTexto(40)).toBe('40');
});

it('remove tudo que nao e digito', () => {
  expect(somenteDigitos('(11) 9-12')).toBe('11912');
});
