import {
  semErros,
  validarCep,
  validarConfirmacaoSenha,
  validarEmail,
  validarLimites,
  validarNome,
  validarSenha,
  validarTelefone,
} from '../validacoes';

describe('validarNome', () => {
  it('aceita nomes com acento, espaço e apóstrofo', () => {
    expect(validarNome('Ana')).toBeNull();
    expect(validarNome('João da Silva')).toBeNull();
    expect(validarNome("Maria D'Ávila")).toBeNull();
  });
  it('recusa vazio, curto, longo e com números', () => {
    expect(validarNome('  ')).toMatch(/Informe/);
    expect(validarNome('A')).toMatch(/2 letras/);
    expect(validarNome('a'.repeat(61))).toMatch(/60/);
    expect(validarNome('Ana123')).toMatch(/letras/);
  });
});

describe('validarEmail', () => {
  it.each(['nome@email.com', ' nome.sobrenome@empresa.com.br '])('aceita %p', (email) => {
    expect(validarEmail(email)).toBeNull();
  });
  it.each(['', 'nome', 'nome@', 'nome@email', 'nome @email.com'])('recusa %p', (email) => {
    expect(validarEmail(email)).not.toBeNull();
  });
});

describe('validarTelefone', () => {
  it('aceita celular e fixo mascarados', () => {
    expect(validarTelefone('(11) 91234-5678')).toBeNull();
    expect(validarTelefone('(11) 3456-7890')).toBeNull();
  });
  it('recusa incompleto, DDD com zero e celular sem 9', () => {
    expect(validarTelefone('')).toMatch(/Informe/);
    expect(validarTelefone('(11) 9123')).toMatch(/incompleto/);
    expect(validarTelefone('(01) 3456-7890')).toMatch(/DDD/);
    expect(validarTelefone('(11) 81234-5678')).toMatch(/9/);
  });
});

describe('validarCep', () => {
  it('aceita 8 dígitos', () => expect(validarCep('01001-000')).toBeNull());
  it('recusa vazio, incompleto e só zeros', () => {
    expect(validarCep('')).toMatch(/Informe/);
    expect(validarCep('0100')).toMatch(/8/);
    expect(validarCep('00000-000')).toMatch(/inválido/);
  });
});

describe('senha', () => {
  it('exige 8 caracteres com letras e números', () => {
    expect(validarSenha('Senha123')).toBeNull();
    expect(validarSenha('')).toMatch(/Crie/);
    expect(validarSenha('Ab1')).toMatch(/8/);
    expect(validarSenha('somenteletras')).toMatch(/letras e números/);
    expect(validarSenha('12345678')).toMatch(/letras e números/);
  });
  it('exige confirmação igual', () => {
    expect(validarConfirmacaoSenha('Senha123', 'Senha123')).toBeNull();
    expect(validarConfirmacaoSenha('Senha123', '')).toMatch(/Repita/);
    expect(validarConfirmacaoSenha('Senha123', 'Senha124')).toMatch(/iguais/);
  });
});

describe('validarLimites', () => {
  it('aceita limites em ordem crescente', () => {
    expect(semErros(validarLimites({ atencaoCm: 10, alertaCm: 25, evacuacaoCm: 40 }))).toBe(true);
  });
  it('exige valores preenchidos e dentro da faixa', () => {
    const erros = validarLimites({ atencaoCm: null, alertaCm: 0, evacuacaoCm: 301 });
    expect(erros.atencaoCm).toMatch(/Informe/);
    expect(erros.alertaCm).toMatch(/entre/);
    expect(erros.evacuacaoCm).toMatch(/entre/);
  });
  it('exige que cada nível comece acima do anterior', () => {
    const erros = validarLimites({ atencaoCm: 30, alertaCm: 25, evacuacaoCm: 25 });
    expect(erros.atencaoCm).toBeNull();
    expect(erros.alertaCm).toMatch(/Atenção/);
    expect(erros.evacuacaoCm).toMatch(/Alerta/);
  });
});
