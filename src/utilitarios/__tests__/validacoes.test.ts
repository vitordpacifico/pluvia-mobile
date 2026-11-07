import {
  horaParaData,
  semErros,
  validarCep,
  validarConfirmacaoSenha,
  validarDescricao,
  validarEmail,
  validarHoraDoRelato,
  validarNome,
  validarNomeDoLocal,
  validarReferencia,
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

describe('hora do relato', () => {
  const agora = new Date(2026, 10, 7, 15, 0);

  it('aceita uma hora das últimas 6 horas', () => {
    expect(validarHoraDoRelato('14:30', agora)).toBeNull();
    expect(horaParaData('14:30', agora)?.getHours()).toBe(14);
  });

  it('entende uma hora maior que a atual como de ontem', () => {
    const ontem = horaParaData('23:50', new Date(2026, 10, 7, 0, 10));
    expect(ontem?.getDate()).toBe(6);
    expect(validarHoraDoRelato('23:50', new Date(2026, 10, 7, 0, 10))).toBeNull();
  });

  it('recusa vazio, formato inválido e hora antiga demais', () => {
    expect(validarHoraDoRelato('', agora)).toMatch(/Informe/);
    expect(validarHoraDoRelato('25:99', agora)).toMatch(/inválida/);
    expect(validarHoraDoRelato('14:3', agora)).toMatch(/inválida/);
    expect(validarHoraDoRelato('08:00', agora)).toMatch(/6 horas/);
  });
});

describe('textos do relato e dos locais', () => {
  it('exige referência entre 3 e 80 caracteres', () => {
    expect(validarReferencia('Rua Lavapés')).toBeNull();
    expect(validarReferencia(' ')).toMatch(/Informe/);
    expect(validarReferencia('ab')).toMatch(/3 letras/);
    expect(validarReferencia('a'.repeat(81))).toMatch(/80/);
  });

  it('exige descrição só quando é obrigatória e limita o tamanho', () => {
    expect(validarDescricao('', false)).toBeNull();
    expect(validarDescricao('', true)).toMatch(/Descreva/);
    expect(validarDescricao('a'.repeat(201), false)).toMatch(/200/);
  });

  it('valida o nome do local favorito', () => {
    expect(validarNomeDoLocal('Trabalho')).toBeNull();
    expect(validarNomeDoLocal('')).toMatch(/nome/);
    expect(validarNomeDoLocal('a'.repeat(31))).toMatch(/30/);
  });

  it('diz se um formulário não tem erros', () => {
    expect(semErros({ a: null, b: null })).toBe(true);
    expect(semErros({ a: null, b: 'erro' })).toBe(false);
  });
});
